import React from 'react';
import { render } from '@testing-library/react';

import App from '../components/App';

describe('App', () => {
    test('Header is blue', () => {
      const { getByText } = render(<App />);
      expect(getByText(/^test app$/i)).toHaveStyle('color: blue');
    });
});