describe("NewBill", () => {
    it("should create a new instance of NewBill", () => {
        // Mock dependencies
        const document = {};
        const onNavigate = jest.fn();
        const Store = {};
        const localStorage = {};

        // Create a new instance of NewBill
        const newBill = new NewBill({
            document,
            onNavigate,
            store: Store,
            localStorage,
        });

        // Assert that a new instance is created
        expect(newBill).toBeInstanceOf(NewBill);
    });
});
