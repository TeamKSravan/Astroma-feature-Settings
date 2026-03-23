import { render, fireEvent } from "@testing-library/react-native";
import CoinSummary from "../../../src/components/modals/CoinSummary";
import { useWalletStore } from "../../../src/store/useWalletStore";

describe('CoinSummary', () => {
  beforeEach(() => {
    useWalletStore.setState({ availableCoins: 100 });
  });

  const defaultProps = {
    title: "Test",
    cost: 100,
    visible: true,
  };

  test('should render correctly', () => {
    const closeModal = jest.fn();
    const { getByText } = render(
      <CoinSummary {...defaultProps} closeModal={closeModal} />
    );
    expect(getByText('Download Test')).toBeTruthy();
    expect(getByText('To download Test 100 coins will be deducted')).toBeTruthy();
    expect(getByText('Available Coins')).toBeTruthy();
    expect(getByText('100')).toBeTruthy();
    expect(getByText('Remaining Coins')).toBeTruthy();
    expect(getByText('0')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
    expect(getByText('Continue')).toBeTruthy();
  });

  test('should call closeModal when Cancel is pressed', () => {
    const closeModal = jest.fn();
    const { getByTestId } = render(
      <CoinSummary {...defaultProps} closeModal={closeModal} />
    );
    fireEvent.press(getByTestId('close-button'));
    expect(closeModal).toHaveBeenCalledTimes(1);
  });

  test('should call closeModal when Continue is pressed', () => {
    const closeModal = jest.fn();
    const { getByText } = render(
      <CoinSummary {...defaultProps} closeModal={closeModal} />
    );
    fireEvent.press(getByText('Continue'));
    expect(closeModal).toHaveBeenCalledTimes(1);
  });

  test('should call closeModal when close (X) button is pressed', () => {
    const closeModal = jest.fn();
    const { getAllByTestId } = render(
      <CoinSummary {...defaultProps} closeModal={closeModal} />
    );
    const svgMocks = getAllByTestId('svg-mock');
    fireEvent.press(svgMocks[1]); // Second svg is ModalClose
    expect(closeModal).toHaveBeenCalledTimes(1);
  });
});