import { render, fireEvent } from "@testing-library/react-native";
import ItemUserProfile from "../../../src/components/Home/ItemUserProfile";

describe('ItemUserProfile', () => {
    test('should render correctly', () => {
        const { getByText } = render(<ItemUserProfile user={{ _id: '1', name: 'Test', date_of_birth: '2021-01-01', zodiac_sign: 'test' }} onEdit={() => {}} onDelete={() => {}} />);
        expect(getByText('Test')).toBeTruthy();
    });
    it('should call onEdit when edit button is pressed', () => {
        const onEdit = jest.fn();
        const { getByTestId } = render(<ItemUserProfile user={{ _id: '1', name: 'Test', date_of_birth: '2021-01-01', zodiac_sign: 'test' }} onEdit={onEdit} onDelete={() => {}} />);
        fireEvent.press(getByTestId('edit-button'));
        expect(onEdit).toHaveBeenCalledTimes(1);
    });
    it('should call onDelete when delete button is pressed', () => {
        const onDelete = jest.fn();
        const { getByTestId } = render(<ItemUserProfile user={{ _id: '1', name: 'Test', date_of_birth: '2021-01-01', zodiac_sign: 'test' }} onEdit={() => {}} onDelete={onDelete} />);
        fireEvent.press(getByTestId('delete-button'));
        expect(onDelete).toHaveBeenCalledTimes(1);
    });
});