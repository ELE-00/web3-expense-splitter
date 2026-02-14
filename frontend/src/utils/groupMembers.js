const STORAGE_KEY = "groupMembers";

export function getGroupMembers(groupAddress) {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  return data[groupAddress] || {};
}

export function setMemberName(groupAddress, memberAddress, name) {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

  if (!data[groupAddress]) {
    data[groupAddress] = {};
  }

  // Store with lowercase address for consistent lookups
  data[groupAddress][memberAddress.toLowerCase()] = name;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}