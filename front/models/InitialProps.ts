import { IncomingMessage, ServerResponse } from 'http';

/**
 * Next.js does not have the context object that getInitialProps receive. 
 */
export default interface InitialProps {
  pathname: string
  query: any
  asPath?: string;
  req?: IncomingMessage
  res?: ServerResponse
  jsonPageRes?: Response
  err?: Error
}