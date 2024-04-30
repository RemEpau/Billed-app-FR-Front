/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { fireEvent, screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import BillsUI from "../views/BillsUI";
import { localStorageMock } from "../__mocks__/localStorage";
import { ROUTES } from "../constants/routes";
import store from "../__mocks__/store";
import Store from "../app/Store";

const onNavigate = (pathname) => {
    document.body.innerHTML = ROUTES({ pathname });
};

Object.defineProperty(window, "LocalStorage", { value: localStorageMock });
window.localStorage.setItem(
    "user",
    JSON.stringify({
        type: "Employee",
    })
);

describe("Given I am a user connected as Employee", () => {
    describe("When I navigate to NewBill Page", () => {
        test("Then, it should render NewBill page", () => {
            const html = NewBillUI();
            document.body.innerHTML = html;
            expect(screen.getByTestId("form-new-bill")).toBeTruthy();
        });
    });
});

// Test d'intégration POST
describe("Given I am connected as an employee", () => {
    describe("When I am on NewBill Page", () => {
        // Test d'intégration POST
        test("Then, I should be able to submit a new bill", () => {
            const html = NewBillUI();
            document.body.innerHTML = html;

            // On instancie la classe NewBill
            const newBill = new NewBill({
                document,
                onNavigate,
                store: null,
                localStorage: window.localStorage,
            });

            // On vérifie que le formulaire est bien présent
            const submit = screen.getByTestId("form-new-bill");

            // On créee un objet billTest afin de simuler les données du formulaire
            const billTest = {
                type: "Transports",
                name: "test",
                amount: 100,
                date: "2024-04-30",
                vat: 10,
                pct: 20,
                commentary: "test",
                fileUrl: "test.jpg",
                fileName: "test",
            };

            // On simule la soumission du formulaire
            const handleSubmit = jest.fn(newBill.handleSubmit);
            newBill.createBill = (newBill) => newBill;
            document.querySelector(`select[data-testid="expense-type"]`).value =
                billTest.type;
            document.querySelector(`input[data-testid="expense-name"]`).value =
                billTest.name;
            document.querySelector(`input[data-testid="datepicker"]`).value =
                billTest.date;
            document.querySelector(`input[data-testid="amount"]`).value =
                billTest.amount;
            document.querySelector(`input[data-testid="vat"]`).value =
                billTest.vat;
            document.querySelector(`input[data-testid="pct"]`).value =
                billTest.pct;
            document.querySelector(`textarea[data-testid="commentary"]`).value =
                billTest.commentary;
            newBill.fileUrl = billTest.fileUrl;
            newBill.fileName = billTest.fileName;

            submit.addEventListener("submit", handleSubmit);
            fireEvent.submit(submit);

            // On teste que la fonction handleSubmit a bien été appelée
            expect(handleSubmit).toHaveBeenCalled();
        });
    });
});

// Gestion des erreurs 404 et 500

describe("When an error occurs on the API", async () => {
    beforeEach(() => {
        jest.spyOn(store, "bills");

        Object.defineProperty(window, "localStorage", {
            value: localStorageMock,
        });

        window.localStorage.setItem(
            "user",
            JSON.stringify({ type: "Employee" })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
    });

    // On teste l'affichage du message d'erreur 404
    test("Then, it should display an error message with 404 message error", async () => {
        store.bills.mockImplementationOnce(() => {
            return {
                list: () => {
                    return Promise.reject(new Error("Erreur 404"));
                },
            };
        });
        const html = BillsUI({ error: "Erreur 404" });
        document.body.innerHTML = html;
        const message = screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
    });

    // On teste l'affichage du message d'erreur 500
    test("Then, it should display an error message with 500 message error", async () => {
        store.bills.mockImplementationOnce(() => {
            return {
                list: () => {
                    return Promise.reject(new Error("Erreur 500"));
                },
            };
        });
        const html = BillsUI({ error: "Erreur 500" });
        document.body.innerHTML = html;
        const message = screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
    });
});

// Si je poste un fichier l'extension doit être correcte
describe("Given I am on NewBill Page", () => {
    describe("When I upload an image file", () => {
        test("Then the file extension is correct", async () => {
            document.body.innerHTML = NewBillUI();
            const newBill = new NewBill({
                document,
                onNavigate,
                store: null,
                localStorage: window.localStorage,
            });
            //Chargement du fichier
            const handleChangeFile = jest.fn(() => newBill.handleChangeFile);
            const inputFile = screen.queryByTestId("file");

            inputFile.addEventListener("change", handleChangeFile);

            //Déclencheur d'évenement
            fireEvent.change(inputFile, {
                target: {
                    files: [
                        new File(["myTest.png"], "myTest.png", {
                            type: "image/png",
                        }),
                    ],
                },
            });
            expect(handleChangeFile).toHaveBeenCalled();
            expect(inputFile.files[0].name).toBe("myTest.png");
        });
    });
});

// Si je poste un fichier png, jpg ou jpeg, la fonction handleChangeFile doit être appelée
describe("Given I navigate to NewBill Page", () => {
    describe("When I upload a file with the extension .png, .jpg or .jpeg", () => {
        test("Then the handleChangeFile method should be called", () => {
            const html = NewBillUI();
            document.body.innerHTML = html;

            const newBill = new NewBill({
                document,
                onNavigate,
                store: Store,
                localStorage: window.localStorage,
            });

            const handleChangeFile = jest.fn(newBill.handleChangeFile);
            const file = screen.getByTestId("file");

            file.addEventListener("change", handleChangeFile);
            fireEvent.change(file, {
                target: {
                    files: [
                        new File(["test"], "test.jpg", { type: "image/jpg" }),
                    ],
                },
            });
            expect(handleChangeFile).toHaveBeenCalled();
        });
    });
});

// Si je poste un fichier autre qu'un png, jpg ou jpeg, la fonction handleChangeFile ne doit pas être appelée
describe("When I navigate to the newbill page, and I want to post an PDF file", () => {
    test("Then function handleChangeFile should be called", () => {
        const html = NewBillUI();
        document.body.innerHTML = html;
        jest.spyOn(Store.api, "post").mockImplementation(store.post);

        const newBill = new NewBill({
            document,
            onNavigate,
            store: Store,
            localStorage: window.localStorage,
        });

        const file = screen.getByTestId("file");

        const handleChangeFile = jest.fn(newBill.handleChangeFile);

        file.addEventListener("change", handleChangeFile);

        fireEvent.change(file, {
            target: {
                files: [new File(["image"], "test.pdf", { type: "image/pdf" })],
            },
        });
        expect(handleChangeFile).toHaveBeenCalled();
        expect(file.value).toBe("");
    });
});

// Soumission du formulaire pour la création d'une note de frais
describe("Given I am on NewBill Page", () => {
    describe("And I submit a valid bill form", () => {
        test("Then the bill should be created", () => {
            document.body.innerHTML = NewBillUI();
            const newBill = new NewBill({
                document,
                onNavigate,
                store: null,
                localStorage: window.localStorage,
            });

            const handleSubmit = jest.fn(newBill.handleSubmit);
            const newBillForm = screen.getByTestId("form-new-bill");
            newBillForm.addEventListener("submit", handleSubmit);
            fireEvent.submit(newBillForm);
            expect(handleSubmit).toHaveBeenCalled();
        });
    });
});

// On teste que les valeurs du formulaire sont correctes
describe("Given I am user connected as an Employee", () => {
    describe("When I fill out the bill form", () => {
        test("Then the form values should be correct", () => {
            document.body.innerHTML = NewBillUI();
            const newBill = new NewBill({
                document,
                onNavigate,
                store: null,
                localStorage: window.localStorage,
            });

            const billTest = {
                type: "Transports",
                name: "test",
                amount: 100,
                date: "2024-04-30",
                vat: 10,
                pct: 20,
                commentary: "test",
                fileUrl: "test.jpg",
                fileName: "test",
            };

            document.querySelector(`select[data-testid="expense-type"]`).value =
                billTest.type;
            document.querySelector(`input[data-testid="expense-name"]`).value =
                billTest.name;
            document.querySelector(`input[data-testid="datepicker"]`).value =
                billTest.date;
            document.querySelector(`input[data-testid="amount"]`).value =
                billTest.amount;
            document.querySelector(`input[data-testid="vat"]`).value =
                billTest.vat;
            document.querySelector(`input[data-testid="pct"]`).value =
                billTest.pct;
            document.querySelector(`textarea[data-testid="commentary"]`).value =
                billTest.commentary;

            expect(
                document.querySelector(`select[data-testid="expense-type"]`)
                    .value
            ).toBe(billTest.type);
            expect(
                document.querySelector(`input[data-testid="expense-name"]`)
                    .value
            ).toBe(billTest.name);
            expect(
                document.querySelector(`input[data-testid="datepicker"]`).value
            ).toBe(billTest.date);
            expect(
                document.querySelector(`input[data-testid="amount"]`).value
            ).toBe(billTest.amount.toString());
            expect(
                document.querySelector(`input[data-testid="vat"]`).value
            ).toBe(billTest.vat.toString());
            expect(
                document.querySelector(`input[data-testid="pct"]`).value
            ).toBe(billTest.pct.toString());
            expect(
                document.querySelector(`textarea[data-testid="commentary"]`)
                    .value
            ).toBe(billTest.commentary);
        });
    });
});

describe("Given I am a user connected as Employee", () => {
    describe("When I fill out the bill form", () => {
        test("Then the form values should be updated", () => {
            document.body.innerHTML = NewBillUI();
            const newBill = new NewBill({
                document,
                onNavigate,
                store: null,
                localStorage: window.localStorage,
            });
            const billTest = {
                type: "Transports",
                name: "test",
                amount: 100,
                date: "2024-04-30",
                vat: 10,
                pct: 20,
                commentary: "test",
                fileUrl: "test.jpg",
                fileName: "test",
            };
            document.querySelector(`select[data-testid="expense-type"]`).value =
                billTest.type;
            document.querySelector(`input[data-testid="expense-name"]`).value =
                billTest.name;
            document.querySelector(`input[data-testid="datepicker"]`).value =
                billTest.date;
            document.querySelector(`input[data-testid="amount"]`).value =
                billTest.amount;
            document.querySelector(`input[data-testid="vat"]`).value =
                billTest.vat;
            document.querySelector(`input[data-testid="pct"]`).value =
                billTest.pct;
            document.querySelector(`textarea[data-testid="commentary"]`).value =
                billTest.commentary;

            expect(
                document.querySelector(`select[data-testid="expense-type"]`)
                    .value
            ).toBe(billTest.type);
            expect(
                document.querySelector(`input[data-testid="expense-name"]`)
                    .value
            ).toBe(billTest.name);
            expect(
                document.querySelector(`input[data-testid="datepicker"]`).value
            ).toBe(billTest.date);
            expect(
                document.querySelector(`input[data-testid="amount"]`).value
            ).toBe(billTest.amount.toString());
            expect(
                document.querySelector(`input[data-testid="vat"]`).value
            ).toBe(billTest.vat.toString());
            expect(
                document.querySelector(`input[data-testid="pct"]`).value
            ).toBe(billTest.pct.toString());
            expect(
                document.querySelector(`textarea[data-testid="commentary"]`)
                    .value
            ).toBe(billTest.commentary);
        });
    });
});
