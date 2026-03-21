import { render } from "@testing-library/react-native";
import CoinSummary from "../../../src/components/modals/CoinSummary";

describe('CoinSummary', () => {
  test('should render correctly', () => {
    const { getByText } = render(<CoinSummary title="Test" cost={100} closeModal={() => {}} visible={true} />);
    expect(getByText('Download Test')).toBeTruthy();
    expect(getByText('To download Test 100 coins will be deducted')).toBeTruthy();
    expect(getByText('Available Coins')).toBeTruthy();
    expect(getByText('100')).toBeTruthy();
    expect(getByText('Remaining Coins')).toBeTruthy();
    expect(getByText('0')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
    expect(getByText('Continue')).toBeTruthy();
  });
});