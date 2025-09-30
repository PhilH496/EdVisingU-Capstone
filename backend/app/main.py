from fastapi import FastAPI

app = FastAPI(title="EdvisingU-Capstone Backend")


@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.get("/")
async def root():
    return {"message": "EdvisingU-Capstone Backend is running"}
