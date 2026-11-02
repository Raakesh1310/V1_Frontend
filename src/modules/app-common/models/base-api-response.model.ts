export interface BaseApiResponseModel {
  success: boolean;
  code: number;
  errors: string[];
  itemsCount: number;
  allItemsCount: number;
  page: number;
  message: string;
}
