angular.module('launchpad.services', ['firebase'])

.factory('LaunchPad', function($firebaseAuth, $firebase, companyName) {
  //Shared Data within Factory
  var firebaseAuthObj = {}; 
  var firebaseName = {}; 
  var firebase_URI = {}; 
  var userSettings = {};
  var userApps = [];
  var userName = {};
      
  var getAuthObj = function (){ 
    firebase_URI = "https://" + companyName + ".firebaseio.com"
    ref = new Firebase(firebase_URI);
    firebaseAuthObj = $firebaseAuth(ref);
    return firebaseAuthObj;
  };

  var logOut = function(){
    firebaseAuthObj.unauth();
  };

 var getUserSettings = function (){   
    ref = new Firebase(firebase_URI + '/users/' + getUserName());
    userSettings = $firebase(ref).$asObject().$loaded();
    return userSettings; 
  };


  var getUserName = function(){
    userName = firebaseAuthObj.$getAuth().password.email.split("@")[0]; 
    return userName;
  };
  
  var getUserApps = function (userName){
    ref = new Firebase(firebase_URI + '/users/' + userName + '/apps');  
    userApps = $firebase(ref).$asArray().$loaded();
    return userApps;
  };

 var getConfig = function(){
    ref = new Firebase(firebase_URI + '/config');  
    config = $firebase(ref).$asObject().$loaded();
    return config;
  };

  var getAppInfo = function (appName){
    ref = new Firebase(firebase_URI + '/apps/' + appName);     
    var appinfo = $firebase(ref).$asObject();  //get info for this app 
    return appinfo;
  };

  var getDefaultApp = function (apps){
    return userSettings.defaultApp;
  };

  var saveUserApps = function(userApps, userName){
    ref = new Firebase(firebase_URI + '/users/' + userName);  
    fbuserApps = $firebase(ref).$asObject();
    fbuserApps.$loaded()
    .then(function(){
      fbuserApps.apps = userApps; 
      fbuserApps.$save()
    })
  }

  var userAuthForState = function(state) {
    if(state == 'app.contacts') {
      return true;
    }
    else {
      return false;
    }
  }

return {
      getAuthObj: getAuthObj,
      logOut: logOut,
      getUserSettings: getUserSettings,
      getUserName: getUserName,
      getDefaultApp: getDefaultApp,
      getUserApps: getUserApps, 
      saveUserApps: saveUserApps,
      userAuthForState: userAuthForState, 
      userApps: userApps,
      getConfig: getConfig
  }       
})

.filter('moment', function() {
    return function(dateString, format) {
        return moment(dateString).format(format);
    };
})


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
        config.CRM_Url + "/dynamic/-/activities?format=json&where=" + entity  + " eq '" + entityId + "'",
        { headers: {'Authorization':  'Basic ' + btoa(config.username + ":" + config.password) }}
      )  
    };

    var getEntitiesByQuery = function (config, entity, query){
      return $http.get(
        config.CRM_Url + "/dynamic/-/" + entity + "?format=json" + query,
        { headers: {'Authorization':  'Basic ' + btoa(config.username + ":" + config.password) }}
      )
    };

    var createEntityRecord = function(config,entity,record){
      return $http.post(
        config.CRM_Url + "/dynamic/-/" + entity ,
        record,
        { 
          headers: {'Authorization':  'Basic ' + btoa(config.username + ":" + config.password)}, 
        }
      ) 
    }

    var getCityState = function(zip){
      return $http.get(
        'http://ziptasticapi.com/' + zip
      ) 
    }

    return {
        getUserEntities: getUserEntities, 
        getUserEntityGroups: getUserEntityGroups,
        getEntityDetails: getEntityDetails,
        getEntityHistory: getEntityHistory,
        getEntityActivities: getEntityActivities,
        createEntityRecord: createEntityRecord ,
        getEntitiesByQuery: getEntitiesByQuery,
        getCityState: getCityState 
    }
})



.factory('Avatars',  function ($http, $q) {
  var allAvatars = {};

  //get all avatars 
  var getAllAvatars = function(){
      var deferred = $q.defer();

      $http.get(CRM_URL + "system/-/libraryDirectories(directoryName%20eq%20'Avatars')/documents?format=json")
      .then(function(avatars){
        allAvatars = avatars.data.$resources;
        angular.forEach(allAvatars, function(avatar){
          getAvatarImage(avatar)  //load the image for each attachment via a promise
          .then(function(response){
            avatar.imageURI = window.URL.createObjectURL(response.data);
          });
          deferred.resolve(allAvatars);
        }) 
      })
      .catch(function(error){
        deferred.rejected(error);
      })  
    return deferred.promise;
    };

    var getAvatarImage =  function(avatar) {
      var url = avatar.$url;
      //url = url.substring(0, url.indexOf('?'));
      //url = url.replace("dynamic", "system");  //quirk with sData when downloading blob info needs to be system
      // setup to get blob of image back
      return($http.get(url+ "/file", {responseType: "blob"}));
    };

    var getUserAvatar = function(User) {
      var file = User.trim().concat('.jpg');
      var avatar = _.find(allAvatars, { 'fileName' : file });
      return avatar.imageURI;
    };

    return {
      getAllAvatars: getAllAvatars,
      getUserAvatar: getUserAvatar
    }
})

//.constant('SUGAR_CRM_URI', 'https://lhcugu5051.trial.sugarcrm.com/rest/v10/')  //TODO move to firebase 
//.constant('SUGAR_REFRESHTOKEN', '6cd609f0-f412-a9d3-b2f8-549196393687')
.factory('SugarCRM',  function ($http, $q) {

  var getAccessToken = function(SugarCRM_URI){
    return true;
    /*
    return $http({
        method: 'POST',
        url: SugarCRM_URI + 'oauth2/token',
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'no-cache'
        },
        data: {
            "grant_type":"password",
           "client_id":"sugar",
           "client_secret":"",
           "username":"tberry",
           "password":"Sa42013!",
           "platform":"base"
      }
      });
  */
  };

   var getUserEntities = function (SugarCRM_URI, token, entity, query, filter){
      return $http({
        method: 'Get',
        url: SugarCRM_URI + entity + '?' + query,
        headers: {
          'OAuth-Token': token
        },
        params: {
          'filter': JSON.stringify(filter)
        }
      })
    };

    var getEntityDetails = function (SugarCRM_URI, token, entity, Id, fields){
      return $http({
        method: 'Get',
        url: SugarCRM_URI + entity + '/' + Id,
        headers: {
          'OAuth-Token': token
        },
        params: {
          'fields': fields
        }
      })
    };

    var getEntityLinks = function (SugarCRM_URI, token, entity, Id, linktype, fields){
      return $http({
        method: 'Get',
        url: SugarCRM_URI + entity + '/' + Id + '/link/' + linktype,
        headers: {
          'OAuth-Token': token
        },
        params: {
          'fields': fields
        }
      })
    };

    var getUserPicture = function(SugarCRM_URI, token, userId){
    return $http({
        method: 'Get',
        url: SugarCRM_URI +  'Users/' + userId + '/file/picture', 
        headers: {
          'OAuth-Token': token
        },
        params: {
          'format': 'sugar_html_json',
          'platform': 'base'
        }
      })
    };



     //Entity Related Methods
    var getUserEntityGroups = function (SugarCRM_URI, token, entity){
      return $http({
        method: 'Get',
        headers: {
          'OAuth-Token': token
        },
        url: SugarCRM_URI + 'Filters/' ,
        params: {
          'filter[0][created_by]' : 1,
          'filter[1][module_name]': entity
        }  
      })
    };

     return {
        getUserEntities: getUserEntities,
        getEntityDetails: getEntityDetails,
        getEntityLinks: getEntityLinks,
        getUserEntityGroups: getUserEntityGroups,
        getAccessToken: getAccessToken,
        getUserPicture: getUserPicture
    }

})


