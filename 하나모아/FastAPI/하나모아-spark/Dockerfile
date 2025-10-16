FROM python:3.11

LABEL "language"="python"
LABEL "framework"="fastapi"

# Install Java
RUN apt-get update && \
    apt-get install -y default-jre-headless && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set Java home
ENV JAVA_HOME=/usr/lib/jvm/default-java
ENV PATH="${JAVA_HOME}/bin:${PATH}"

WORKDIR /app

# Copy spark-analytics-service directory
COPY spark-analytics-service/ .

# Install Python dependencies manually with all required packages
RUN pip install --no-cache-dir \
    fastapi==0.104.1 \
    uvicorn[standard]==0.24.0 \
    pyspark==3.5.0 \
    pandas==2.1.3 \
    numpy==1.25.2 \
    python-multipart==0.0.6 \
    pydantic-settings==2.0.3 \
    pydantic==2.4.2 \
    sqlalchemy==2.0.23 \
    pymysql==1.1.0 \
    python-dotenv==1.0.0

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]