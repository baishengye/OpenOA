export class OpenIMApiError extends Error {
  override name: string = 'OpenIMApiError';
  code: number;
  override message: string;
  operationID: string;

  constructor(code: number, message: string, operationID: string) {
    super(message);
    this.code = code;
    this.message = message;
    this.operationID = operationID;
  }

  toJSON() {
    return {
      name: this.name,
      operationID: this.operationID,
      code: this.code,
      message: this.message,
    };
  }
}
