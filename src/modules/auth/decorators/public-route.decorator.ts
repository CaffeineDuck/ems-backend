import { SetMetadata } from '@nestjs/common';

export const PUBLIC_ROUTE_KEY = 'PUBLIC_ROUTE';

export const Public = () => SetMetadata(PUBLIC_ROUTE_KEY, true);
