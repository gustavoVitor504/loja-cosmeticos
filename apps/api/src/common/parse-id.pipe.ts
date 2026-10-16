import { HttpStatus, ParseUUIDPipe } from '@nestjs/common'

/** IDs inválidos na URL respondem 404, como um registro inexistente. */
export const ParseIdPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND })
