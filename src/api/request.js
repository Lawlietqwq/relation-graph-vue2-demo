import httpRequest from '@/api/config-request'

export async function getStockNode(ts_code, end_date){
    return await httpRequest.get('/stock', {ts_code:ts_code, end_date:end_date})
}

export async function getHolderNode(holder_name, end_date){
  return await httpRequest.get('/holder', {holder_name:holder_name, end_date:end_date})
}