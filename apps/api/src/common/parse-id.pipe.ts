import { HttpStatus, ParseUUIDPipe } from '@nestjs/common'

export const ParseIdPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND })
