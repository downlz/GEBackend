function dropIfDNE(Obj, arr) {
    for (var i = 0, size = arr.length; i < size ; i++) {
      if (!Obj[arr[i]]) delete Obj[arr[i]];
    }
  }

module.exports = function getRec(page,pageSize) {
    if (page) {
      if (pageSize) {
        rowslimit = parseInt(pageSize)
      } else {
        rowslimit = 15;  
      }
      recordtoskip = (page - 1) * rowslimit;
    } else {
      recordtoskip = 0;
      rowslimit = 0;
    }
    return [recordtoskip,rowslimit];
}