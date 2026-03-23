import { render, fireEvent } from "@testing-library/react-native";
import ItemNotification, { NotificationType } from "../../../src/components/Home/ItemNotification";

describe('ItemNotification', () => {

    test('should rtender correctly', () => {
        const { getByText } = render(<ItemNotification item={{ _id: '1', title: 'Test', message: 'Test', send_at: '2021-01-01', is_read: false, type: 'test' }} onPress={() => { }} />);
        expect(getByText('Test')).toBeTruthy();
    });

    it('should call onPress when item is pressed', () => {
        const onPress = jest.fn();
        const { getByTestId } = render(<ItemNotification item={{ _id: '1', title: 'Test', message: 'Test', send_at: '2021-01-01', is_read: false, type: 'test' }} onPress={onPress} />);
        fireEvent.press(getByTestId('item-notification'));
        expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should render correctly with title and message', () => {
        const { getByText } = render(
            <ItemNotification
                item={{ _id: '1', title: 'Test', message: 'Test', send_at: '2021-01-01', is_read: false, type: NotificationType.calender }}
                onPress={() => { }}
            />);
        expect(getByText('Test')).toBeTruthy();
    });

    it('should render correctly with compatibility type', () => {
        const { getByTestId } = render(
            <ItemNotification
                item={{ _id: '1', title: 'Test', message: 'Test', send_at: '2021-01-01', is_read: false, type: NotificationType.compatibility }}
                onPress={() => { }}
            />);
        expect(getByTestId('compatibility-icon')).toBeTruthy();
    });

    it('should render correctly with horoscope type', () => {
        const { getByTestId } = render(
            <ItemNotification
                item={{ _id: '1', title: 'Test', message: 'Test', send_at: '2021-01-01', is_read: false, type: NotificationType.horoscope }}
                onPress={() => { }}
            />);
        expect(getByTestId('horoscope-icon')).toBeTruthy();
    });

    it('should render correctly with lucky type', () => {
        const { getByTestId } = render(
            <ItemNotification
                item={{ _id: '1', title: 'Test', message: 'Test', send_at: '2021-01-01', is_read: false, type: NotificationType.lucky }}
                onPress={() => { }}
            />);
        expect(getByTestId('lucky-icon')).toBeTruthy();
    });

    it('should render correctly with moon type', () => {
        const { getByTestId } = render(
            <ItemNotification
                item={{ _id: '1', title: 'Test', message: 'Test', send_at: '2021-01-01', is_read: false, type: NotificationType.moon }}
                onPress={() => { }}
            />);
        expect(getByTestId('moon-icon')).toBeTruthy();
    });

    it('should render correctly with default type', () => {
        const { getByTestId } = render(
            <ItemNotification
                item={{ _id: '1', title: 'Test', message: 'Test', send_at: '2021-01-01', is_read: false, type: 'test' }}
                onPress={() => { }}
            />);
        expect(getByTestId('lucky-icon')).toBeTruthy();
    });

})