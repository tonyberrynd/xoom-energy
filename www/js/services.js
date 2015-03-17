angular.module('starter.services', [])

.constant('companyName', 'SA4-Demo')
.constant('config.CRM_Url', 'http://SA4Demo-mfg.cloudapp.net:3333/sdata/slx')

.factory('InforCRM',  function ($http, $q) {

    $http.defaults.useXDomain = true;
    $http.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    //$http.defaults.headers.common['Authorization'] = 'Basic ' + btoa("admin" + ":" + "");
    $http.defaults.headers.common.withCredentials = true;

      
    //Entity Related Methods
    var getUserEntityGroups = function (config, entity, userName){
      return $http.get(
        config.CRM_Url + "/system/-/groups/?format=json&where=family eq '" + entity + "'",
        { headers: {'Authorization':  'Basic ' + btoa(config.username + ":" + config.password) }}

      )  
    };

    var getUserEntities = function (config, groupId){
      return $http.get(
        config.CRM_Url + "/system/-/groups/$queries/execute?format=json&_groupId=" + groupId,
        { headers: {'Authorization':  'Basic ' + btoa(config.username + ":" + config.password) }}
      )
    };

    var getEntityDetails = function (config, entity, entityId, query){
      return $http.get(
        config.CRM_Url + "/dynamic/-/" + entity + "('" + entityId + "')?format=json" + query,
        { headers: {'Authorization':  'Basic ' + btoa(config.username + ":" + config.password) }}
      )
    };

    var getEntityHistory = function (config, entity, entityId){
      return $http.get(
          config.CRM_Url + "/dynamic/-/history?format=json&where=" + entity  + " eq '" + entityId + "'",
          { headers: {'Authorization':  'Basic ' + btoa(config.username + ":" + config.password) }}
        )  
    };

     var getEntityActivities = function (config, entity, entityId){
      return $http.get(
        CRM_Url + "/dynamic/-/activities?format=json&where=" + entity  + " eq '" + entityId + "'",
        { headers: {'Authorization':  'Basic ' + btoa(config.username + ":" + config.password) }}
      )  
    };

    return {
        getUserEntities: getUserEntities, 
        getUserEntityGroups: getUserEntityGroups,
        getEntityDetails: getEntityDetails,
        getEntityHistory: getEntityHistory,
        getEntityActivities: getEntityActivities  
    }
})
