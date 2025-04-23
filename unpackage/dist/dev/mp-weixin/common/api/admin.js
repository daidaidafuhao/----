"use strict";
const common_api_request = require("./request.js");
function addAdmin(openid, targetOpenid) {
  return common_api_request.request.callCloudFunction("admin-service", {
    action: "addAdmin",
    params: {
      openid,
      targetOpenid
    }
  });
}
function getStatistics(openid) {
  return common_api_request.request.callCloudFunction("admin-service", {
    action: "statistics",
    params: {
      openid
    }
  });
}
function exportAllData(openid, dateRange, format = "xlsx") {
  return common_api_request.request.callCloudFunction("admin-service", {
    action: "export",
    params: {
      openid,
      dateRange,
      format
    }
  });
}
exports.addAdmin = addAdmin;
exports.exportAllData = exportAllData;
exports.getStatistics = getStatistics;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/common/api/admin.js.map
