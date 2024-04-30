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

describe("Given I am connected as an employee", () => {
    describe("When I am on NewBill Page", () => {
        test("Then ...", () => {
            const html = NewBillUI();
            document.body.innerHTML = html;
            //to-do write assertion
        });
    });
});
