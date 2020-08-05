import React from 'react';
import { render } from '@testing-library/react';

import App from '../components/App';

describe('App', () => {
  test('Header color is correct', () => {
    const { getByText } = render(<App color="red" />);
    expect(getByText(/^test app$/i)).toHaveStyle('color: red');
  });
});
