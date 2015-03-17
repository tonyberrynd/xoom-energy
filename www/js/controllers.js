angular.module('starter.controllers', [])

.controller('contactUsCtrl', function($scope, InforCRM) {

  $scope.lead = {};
  $scope.result = "Please enter your information and then submit";
  
  var config = {
    "CRM_Url" : "http://SA4Demo-mfg.cloudapp.net:3333/sdata/slx",
    "password" : "password",
    "username" : "admin"
  };

  $scope.createLead = function(){
    alert("create lead");
  };

  $scope.getUserLeads = function(id){
    InforCRM.getUserEntities(config, id)
    .then(function(leads){
      $scope.data.leads = leads.data.$resources;   
    })
  };

  $scope.createLead = function(){
    InforCRM.createEntityRecord(config, 'Leads', $scope.lead)
    .then(function(lead){
      $scope.lead = {};
      $scope.result = "Thank you, we will be in touch soon";   
    })
  }

   //Helper function for getCityState
  String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  };

  $scope.getCityState = function(){
    InforCRM.getCityState($scope.lead.address.PostalCode)
    .then(function(zipInfo){
      $scope.lead.address.City = zipInfo.data.city.toProperCase();
      $scope.lead.address.State = zipInfo.data.state;
    })
  }

  //$scope.data.leads = $scope.getUserLeads('p6UJ9A0004LT')

})

.controller('requestQuoteCtrl', function($scope, InforCRM) {
  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  }
})

.controller('orderPartsCtrl', function($scope, $stateParams, InforCRM) {

  $scope.partsOrder = {};
  $scope.products = {};

  var config = {
    "CRM_Url" : "http://SA4Demo-mfg.cloudapp.net:3333/sdata/slx",
    "password" : "password",
    "username" : "admin"
  };

  $scope.products = [
    {"SerialNumber" : "1", "ProductName": "product1"},
    {"SerialNumber" : "2", "ProductName": "product2"},
    {"SerialNumber" : "3", "ProductName": "product3"}
  ];

  $scope.getProductsByEmail = function() {
    InforCRM.getEntitiesByQuery(config, "accountproducts", 
        "&select=ProductName,SerialNumber,Contact/Email&where=Contact.Email eq '" + $scope.partsOrder.Email + "'")
    .then(function(products){
      $scope.products = products.data.$resources;
    })

    InforCRM.getEntitiesByQuery(config, "contacts", 
      "&where=Email eq '" + $scope.partsOrder.Email + "'")
    .then(function(contact){
      $scope.partsOrder = contact.data.$resources[0];
    })
  };
})


.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
