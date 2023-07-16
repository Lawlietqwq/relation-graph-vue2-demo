import httpRequest from '@/api/config-request'

export async function getStockNode(ts_code, end_date){
  console.log(end_date)
    return await httpRequest.get('/stock', {ts_code:ts_code, end_date:end_date})
}

export async function getHolderNode(holder_name, end_date){
  return await httpRequest.get('/holder', {holder_name:holder_name, end_date:end_date})
}

export async function getMap(ts_code, end_date){
  return await httpRequest.get('/stock/oneHop', {ts_code:ts_code, end_date:end_date})
}

export async function getFirstDateByCode(ts_code){
  return await httpRequest.get('/stock/annDate', {ts_code:ts_code})
}

export async function getIndustries(){
  return await httpRequest.get('/stock/industry', {ts_code:ts_code})
}

export async function getOptions(){
  return await httpRequest.get('/stock/options')
}

export async function getCodes(){
  return await httpRequest.get('/stock/codes')
}