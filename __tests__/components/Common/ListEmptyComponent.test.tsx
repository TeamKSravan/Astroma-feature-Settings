import { render, fireEvent } from "@testing-library/react-native";
import ListEmptyComponent from "../../../src/components/Common/ListEmptyComponent";

describe('ListEmptyComponent', ()=>{


    test('should render correctly',()=>{
            const { getByText } = render(<ListEmptyComponent />)
            expect(getByText('No data found')).toBeTruthy();
    })
    it('should call addUser when addUser button is pressed', () => {

        const addUser = jest.fn();
        const { getByTestId } = render(<ListEmptyComponent noButton={false}  addUser={addUser}/>)
        fireEvent.press(getByTestId('add-user-button'));
        expect(addUser).toHaveBeenCalledTimes(1);
    })
    it('should render correctly with title and description', () => {
        const { getByText } = render(<ListEmptyComponent title="Test Title" description="Test Description" />)
        expect(getByText('Test Title')).toBeTruthy();
        expect(getByText('Test Description')).toBeTruthy();
    })
    it('should render correctly with noButton', () => {
        const { getByText } = render(<ListEmptyComponent noButton={true} />)
        expect(getByText('No data found')).toBeTruthy();
    })
    it('should render correctly with addUserText', () => {
        const { getByText } = render(<ListEmptyComponent addUserText="Test Add User Text" />)
        expect(getByText('Test Add User Text')).toBeTruthy();
    })
    it('should render correctly with addUserText and noButton', () => {
        const { getByText } = render(<ListEmptyComponent addUserText="Test Add User Text" noButton={true} />)
        expect(getByText('Test Add User Text')).toBeTruthy();
    })
})