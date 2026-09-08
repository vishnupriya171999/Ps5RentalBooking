import test from 'node:test'
import assert from 'node:assert/strict'
import { validateCustomerDetails, buildCustomerDetails } from './customerValidation.js'

const complete = {
  name: 'Priya S', mobile: '9876543210', door: 'Flat 2B', address: '12 Lake Road, Velachery',
  city: 'Chennai', pincode: '600042', need: '', addressConfirmed: true,
  location: { latitude: 12.97, longitude: 80.22 }, mapsLink: 'https://maps.google.com/?q=12.97,80.22',
}

test('requires successfully captured coordinates, not just a link or button click', () => {
  assert.ok(validateCustomerDetails({ ...complete, location: null }).location)
  assert.ok(validateCustomerDetails({ ...complete, mapsLink: 'https://maps.google.com/?q=0,0' }).location)
  assert.deepEqual(validateCustomerDetails(complete), {})
})

test('each missing required detail has a custom error', () => {
  for (const field of ['name', 'mobile', 'door', 'address', 'city', 'pincode', 'mapsLink']) {
    assert.ok(validateCustomerDetails({ ...complete, [field]: '' })[field === 'mapsLink' ? 'location' : field], field)
  }
  assert.ok(validateCustomerDetails({ ...complete, addressConfirmed: false }).addressConfirmed)
})

test('rejects malformed phone, PIN, name, address and excessive optional notes', () => {
  for (const [field, value] of [['mobile', '1234567890'], ['mobile', '98765432100'], ['pincode', '000000'], ['pincode', '60004a'], ['name', '1234'], ['address', 'https://maps.google.com/'], ['address', 'Chennai'], ['need', 'x'.repeat(501)]]) {
    assert.ok(validateCustomerDetails({ ...complete, [field]: value })[field], field)
  }
})

test('supports local-language names and optional empty notes', () => {
  assert.deepEqual(validateCustomerDetails({ ...complete, name: 'பிரியா', city: 'சென்னை' }), {})
})

test('passes a complete delivery address and map pin to the booking callback', () => {
  const result = buildCustomerDetails({ ...complete, name: ' Priya S ' })
  assert.equal(result.name, 'Priya S')
  assert.equal(result.address, 'Flat 2B, 12 Lake Road, Velachery, Chennai, 600042')
  assert.equal(result.mapsLink, complete.mapsLink)
  assert.deepEqual(result.location, complete.location)
})
