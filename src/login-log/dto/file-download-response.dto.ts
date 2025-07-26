import { ApiProperty } from '@nestjs/swagger';

export class FileDownloadResponseDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'PDF file stream',
  })
  file: Buffer;
}
