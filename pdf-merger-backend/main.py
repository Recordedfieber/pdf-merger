from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfWriter, PdfReader
import io
from typing import List

app = FastAPI()

# Allow Frontend to communicate with Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/merge")
async def merge_pdfs(
    files: List[UploadFile] = File(...),
    output_filename: str = Form("merged.pdf"),
):
    try:
        merger = PdfWriter()

        # Iterate through uploaded files in the order they were received
        for file in files:
            # Read the file into memory
            file_content = await file.read()
            pdf_stream = io.BytesIO(file_content)
            reader = PdfReader(pdf_stream)

            # Add all pages to the merger
            for page in reader.pages:
                merger.add_page(page)

        # Write result to a memory buffer
        output_buffer = io.BytesIO()
        merger.write(output_buffer)
        output_buffer.seek(0)
        merger.close()

        # Get the file size (Critical for download progress bar)
        file_size = output_buffer.getbuffer().nbytes

        # Ensure filename ends with .pdf
        if not output_filename.endswith(".pdf"):
            output_filename += ".pdf"

        # Return the file as a downloadable stream
        return StreamingResponse(
            output_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={output_filename}",
                "Content-Length": str(file_size),
            },
        )

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(
            status_code=500, detail="An error occurred while processing PDFs."
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
