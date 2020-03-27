function dropIfDNE(Obj, arr) {
    for (var i = 0, size = arr.length; i < size ; i++) {
      if (!Obj[arr[i]]) delete Obj[arr[i]];
    }
  }

module.exports = function getRec(page,pageSize) {
    if (page) {
      recordtoskip = (page - 1) * 10;
      if (pageSize){
        rowslimit = parseInt(pageSize)
      } else {
      rowslimit = 10;  
      }
    } else {
      recordtoskip = 0;
      rowslimit = 0;
    }
    return [recordtoskip,rowslimit];
}