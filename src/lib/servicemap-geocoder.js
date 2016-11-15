import _ from 'lodash';
import ol from 'openlayers';
//import $ from 'jquery';

var geocoderComponent = null;

const CITIES = [
  { 'fi': 'helsinki', 'sv': 'helsingfors' },
  { 'fi': 'espoo', 'sv': 'esbo' },
  { 'fi': 'vantaa', 'sv': 'vanda' },
  { 'fi': 'kauniainen', 'sv': 'grankulla' }
];

function matchCityAndLanguage(addressTokens) {
  let language = null;
  let municipality = null;
  const match = _.findLast(addressTokens, (token) => {
    return _.find(CITIES, (city) => {
      return _.find(city, (name, lang) => {
        if (name === token) {
          language = lang;
          municipality = city.fi;
          return true;
        }
        return false;
      });
    });
  });
  if (match !== undefined) {
    const remainingTokens = _.reject(addressTokens, (token) => {
      return token === match;
    });
    return {
      city: municipality,
      language,
      remainingTokens
    };
  }
  return {
    city: null,
    language: null,
    remainingTokens: addressTokens
  };
}

const NAME_PART_SEPARATOR = /[^-a-zåäö0-9]+/;
const NUMBER_PART = /^([0-9]+).*$/;

function numericPrefix(numberPart) {
  if (!numberPart) {
    return null;
  }
  return numberPart.match(NUMBER_PART)[1];
}

function parseAddressString(addressString) {
  addressString = addressString.toLowerCase();
  const addressTokens = addressString.split(NAME_PART_SEPARATOR);
  const {
    city,
    language,
    remainingTokens
  } = matchCityAndLanguage(addressTokens);

  const numberIndex = _.findIndex(remainingTokens, (token) => {
    return token.match(NUMBER_PART) !== null;
  });
  let streetName;
  if (numberIndex > 0) {
    streetName = remainingTokens.slice(0, numberIndex).join(' ');
  } else {
    streetName = remainingTokens.join(' ');
  }
  const number = numericPrefix(remainingTokens[numberIndex]);
  return {
    street: streetName,
    number,
    city,
    language
  };
}

export function geocodeAddressString(addressString) {
  const address = parseAddressString(addressString);
  if (!address) {
    return;
  }
  let query = { srid: 3879 };
  if (address.language !== null) {
    query.language = address.language;
  }
  if (address.city !== null) {
    query.municipality = address.city;
  }
  query.street = address.street;
  if (address.number) {
    query.number = address.number;
  }
  $.get(
    'https://api.hel.fi/servicemap/v1/address/',
    query,
    ({ results }) => {
      if (results.length < 1) {
        return;
      }
      const coordinates = results[0].location.coordinates;
      geocoderComponent.dispatchEvent({
        type: 'addresschosen',
        coordinates
      });
    }
  );
}

function searchExecuter($event) {
  if ($event.keyCode !== 13) return;
  const query = $($event.currentTarget).val();
  geocodeAddressString(query);
}

function createElement() {
  let element = document.createElement('div');
  element.className = 'ol3-geocoder-container';
  let inputElement = document.createElement('input');
  inputElement.type = 'text';
  inputElement.id = 'gcd-input';
  inputElement.className = 'ol3-geocoder-input-search';
  inputElement.placeholder = 'Etsi katuosoitteella ...';
  element.appendChild(inputElement);
  $(inputElement).keyup(searchExecuter);
  return element;
}

export const createGeocoderComponent = () => {
  geocoderComponent = new ol.control.Control({ element: createElement() });
  return geocoderComponent;
};
