import { DynamoDB } from 'aws-sdk';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import {
  MissingFieldError,
  validateAsSpaceEntry,
} from '../Shared/InputValidator';
import { generateRandomId, getEventBody, addCorsHeader } from '../Shared/Utils';

const TABLE_NAME = process.env.TABLE_NAME;
const dbClient = new DynamoDB.DocumentClient({ region: 'eu-west-1' });

async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const result: APIGatewayProxyResult = {
    statusCode: 200,
    body: 'Hello from DYnamoDb',
  };
  addCorsHeader(result);
  try {
    const item = getEventBody(event);
    item.spaceId = generateRandomId();
    validateAsSpaceEntry(item);
    await dbClient
      .put({
        TableName: TABLE_NAME!,
        Item: item,
      })
      .promise();
    result.body = JSON.stringify({
      id: item.spaceId,
    });
  } catch (error: any) {
    if (error instanceof MissingFieldError) {
      result.statusCode = 403;
    } else {
      result.statusCode = 500;
    }
    result.body = JSON.stringify({ message: error.message });
  }
  return result;
}

export { handler };
