'use strict';

module.exports.parse = function (json) {
  var profile = {}
    ;

  profile.id = json.currentUserId;
  profile.displayName = json.currentHousehold.headOfHousehold.name.split(/, /).reverse().join(' ');

  profile.guest = json.guest;

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

  profile.area = {
    id: json.currentUnits.areaUnitNo
  };
  profile.stake = {
    id: json.currentUnits.stakeUnitNo
  , name: json.currentUnits.stakeName
  , type: json.currentUnits.stake && 'stake'
      || json.currentUnits.mission && 'mission'
      || json.currentUnits.district && 'district'
  , admin: json.currentUnits.userHasStakeAdminRights
  };
  profile.ward = {
    id: json.currentUnits.wardUnitNo
  , name: json.currentUnits.wardName
  , type: json.currentUnits.ward && 'ward'
      || json.currentUnits.branch && 'branch'
  , home: json.currentUnits.usersHomeWard
  , admin: json.currentUnits.userHasWardAdminRights
  , photoAdmin: json.currentUnits.userHasWardPhotoAdminRights
  };
  // TODO iterate over these same as above
  //profile.stakes = json.currentStakes;
  profile.rights = {
  };
  // TODO
  profile.callings = [];

  return profile;
};
