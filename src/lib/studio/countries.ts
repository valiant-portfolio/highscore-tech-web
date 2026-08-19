// Country list for the order form. The only branch that matters commercially is
// Nigeria vs everywhere else: Nigerian customers settle through ALAT by Wema,
// everyone else pays by card. Nigeria is pinned to the top since it is most of
// our volume.

export const NIGERIA = 'NG';

export const COUNTRIES: { code: string; name: string }[] = [
  { code: 'NG', name: 'Nigeria' },
  { code: 'GH', name: 'Ghana' },
  { code: 'KE', name: 'Kenya' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'IE', name: 'Ireland' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'QA', name: 'Qatar' },
  { code: 'IN', name: 'India' },
  { code: 'CN', name: 'China' },
  { code: 'JP', name: 'Japan' },
  { code: 'BR', name: 'Brazil' },
  { code: 'EG', name: 'Egypt' },
  { code: 'CM', name: 'Cameroon' },
  { code: 'CI', name: "Côte d'Ivoire" },
  { code: 'SN', name: 'Senegal' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'UG', name: 'Uganda' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'ZW', name: 'Zimbabwe' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'OTHER', name: 'Somewhere else' },
];

export const COUNTRY_NAME: Record<string, string> = Object.fromEntries(
  COUNTRIES.map((c) => [c.code, c.name]),
);

/** Nigerian customers go through ALAT by Wema; everyone else pays by card. */
export function paymentMethodFor(countryCode: string): 'alatpay' | 'card' {
  return countryCode === NIGERIA ? 'alatpay' : 'card';
}
