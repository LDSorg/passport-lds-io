'use strict';

module.exports.parse = function (json) {
  var profile = {}
    ;

  profile.id = json.currentUserId;
  profile.displayName = json.currentHousehold.headOfHousehold.name.split(/, /).reverse().join(' ');


  profile.emails = [];
  if (json.currentHousehold.headOfHousehold.email) {
    profile.emails.push({ value: json.currentHousehold.headOfHousehold.email }); 
  }
  if (json.currentHousehold.householdInfo.email) {
    profile.emails.push({ value: json.currentHousehold.householdInfo.email }); 
  }
  if ((profile.emails[0]||{}).value === (profile.emails[1]||{}).value) {
    profile.emails.pop();
  }

  profile.phones = [];
  if (json.currentHousehold.headOfHousehold.phone) {
    profile.phones.push({ value: json.currentHousehold.headOfHousehold.phone }); 
  }
  if (json.currentHousehold.householdInfo.phone) {
    profile.phones.push({ value: json.currentHousehold.householdInfo.phone }); 
  }
  if ((profile.phones[0]||{}).value === (profile.phones[1]||{}).value) {
    profile.phones.pop();
  }
  
  profile.address = json.currentHousehold.householdInfo.address;
  profile.address.comment = "THIS FORMAT IS EXPERIMENTAL. IT MAY CHANGE";
  profile.address.map = 'https://lds.org/rcmaps/#x=ward'
    + '&ward=' + json.currentUnits.wardUnitNo
    + '&id=household:' + profile.currentUserId
    ;

  profile.photos = [];
  if (json.currentHousehold.headOfHousehold.imageData) {
    profile.photos.push({ value: json.currentHousehold.headOfHousehold.imageData }); 
  }
  if (json.currentHousehold.householdInfo.imageData) {
    profile.photos.push({ value: json.currentHousehold.householdInfo.imageData }); 
  }
  if ((profile.photos[0]||{}).value === (profile.photos[1]||{}).value) {
    profile.photos.pop();
  }

  return profile;
};
