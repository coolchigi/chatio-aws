# TODO: Document backend API endpoints and usage

# API Documentation

## Base URL
The base URL for all API endpoints is:
```
http://localhost:3001/api
```

## Endpoints

### Health Check
**GET** `/health`
- **Description**: Returns the health status of the backend.
- **Response**:
  ```json
  {
    "status": "ok"
  }
  ```

### Assume Role
**POST** `/api/auth/assume-role`
- **Description**: Assumes an AWS IAM role and returns temporary security credentials.
- **Rate Limit**: 10 requests per 15 minutes per IP.
- **Request Body**:
  ```json
  {
    "roleArn": "string"
  }
  ```
  - `roleArn` (required): The ARN of the IAM role to assume.

- **Response**:
  - **200 OK**:
    ```json
    {
      "accessKeyId": "string",
      "secretAccessKey": "string",
      "sessionToken": "string",
      "expiration": "string"
    }
    ```
  - **400 Bad Request**:
    ```json
    {
      "error": "Role ARN is required"
    }
    ```
    ```json
    {
      "error": "Invalid Role ARN format"
    }
    ```
  - **403 Forbidden**:
    ```json
    {
      "error": "Access denied. Check role trust policy and external ID."
    }
    ```
  - **500 Internal Server Error**:
    ```json
    {
      "error": "Failed to get credentials"
    }
    ```
