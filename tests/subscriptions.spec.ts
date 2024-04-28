import { expect, Page, test } from "@playwright/test";
import { unCamelCase } from "@/utils/helpers";
import { newSubscriptionItem } from "./constants";
import { formInputText, formSelectAutocomplete, formSelectDate, formSelectOption, login } from "./util";

test.describe.configure({ mode: "serial", retries: process.env.CI ? 2 : 0 });

test.describe("create and manage subscriptions", () => {
    let page: Page;

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
    });

    test.afterAll(async () => {
        await cleanupMySubscriptions(page);
        await page.close();
    });

    test("login", async () => {
        await login(page);
    });

    test("cleanup my existing subscriptions", async () => {
        await cleanupMySubscriptions(page);
    });

    test("create a new subscription", async () => {
        await page.goto("/LK/dashboard/my-subscriptions");
        await expect(page).toHaveTitle(/My Subscriptions/);

        await page.getByRole("button", { name: "New Subscription" }).click();
        await expect(page).toHaveTitle(/Create a Subscription/);

        await formInputText(page, "displayName", newSubscriptionItem.displayName);
        await formSelectOption(page, "notificationFrequency", newSubscriptionItem.notificationFrequency);
        await formSelectDate(page, "subscriptionExpiryDate");
        await formSelectOption(page, "type", newSubscriptionItem.type);
        await formSelectAutocomplete(page, "brand", newSubscriptionItem.brand);
        await formInputText(page, "model", newSubscriptionItem.model);
        await formInputText(page, "trim", newSubscriptionItem.trim);
        await formSelectOption(page, "condition", newSubscriptionItem.condition);
        await formSelectAutocomplete(page, "minYearOfManufacture", newSubscriptionItem.minYearOfManufacture);
        await formSelectAutocomplete(page, "maxYearOfManufacture", newSubscriptionItem.maxYearOfManufacture);
        await formSelectAutocomplete(page, "minYearOfRegistration", newSubscriptionItem.minYearOfRegistration);
        await formSelectAutocomplete(page, "maxYearOfRegistration", newSubscriptionItem.maxYearOfRegistration);
        await formInputText(page, "minPrice.amount", newSubscriptionItem.minPrice);
        await formInputText(page, "minMillage.distance", newSubscriptionItem.minMillage);
        await formInputText(page, "maxMillage.distance", newSubscriptionItem.maxMillage);
        const formFieldErrors = await page.locator('[data-testid^="form-field-error-"]').all();
        expect(formFieldErrors.length).toBe(0);
        await page.getByRole("button", { name: "Create" }).click();
    });

    test("verify created subscription", async () => {
        await expect(page).toHaveTitle(/My Subscriptions/);
        await expect(page.getByText(newSubscriptionItem.displayName, { exact: true })).toBeVisible();
        await expect(page.getByText(`Type: ${newSubscriptionItem.type}`)).toBeVisible();
        await expect(page.getByText(`Condition: ${unCamelCase(newSubscriptionItem.condition)}`)).toBeVisible();
        await expect(page.getByText(`Model: ${newSubscriptionItem.model}`)).toBeVisible();
        await expect(page.getByText(`Trim: ${newSubscriptionItem.trim}`)).toBeVisible();
        await expect(
            page.getByText(`Manufactured between: ${newSubscriptionItem.minYearOfManufacture}-${newSubscriptionItem.maxYearOfManufacture}`),
        ).toBeVisible();
        await expect(
            page.getByText(`Registered between: ${newSubscriptionItem.minYearOfRegistration}-${newSubscriptionItem.maxYearOfRegistration}`),
        ).toBeVisible();
    });

    test("visible in my list with filters", async () => {
        await expect(page).toHaveTitle(/My Subscriptions/);

        await page.getByTestId("dashboard-filter").click();
        await formSelectOption(page, "Active", "Inactive");
        await formSelectOption(page, "NotificationFrequency", "OnceAWeek");
        await page.getByRole("button", { name: "Apply Filters" }).click();
        await expect(page.getByText(newSubscriptionItem.displayName, { exact: true })).not.toBeVisible();

        await page.getByTestId("dashboard-filter").click();
        await formSelectOption(page, "Active", "Active");
        await formSelectOption(page, "NotificationFrequency", "OnceADay");
        await page.getByRole("button", { name: "Apply Filters" }).click();
        await expect(page.getByText(newSubscriptionItem.displayName, { exact: true })).toBeVisible();

        await page.getByLabel("Filters Applied").click();
        await page.getByRole("button", { name: "Reset Applied Filters" }).click();
        await expect(page.getByLabel("Filters Applied")).not.toBeVisible();
        await expect(page.getByText(newSubscriptionItem.displayName, { exact: true })).toBeVisible();
    });

    test("visible in all list with filters", async () => {
        await page.goto("/LK/dashboard/subscriptions");
        await expect(page).toHaveTitle(/Manage Subscriptions/);

        await page.getByTestId("dashboard-filter").click();
        await formInputText(page, "UserId", process.env.TEST_ADMIN_ID!);
        await page.getByRole("button", { name: "Apply Filters" }).click();
        await expect(page.getByText(newSubscriptionItem.displayName, { exact: true })).toBeVisible();
    });

    test("update subscription", async () => {
        await page.goto("/LK/dashboard/my-subscriptions");
        await expect(page).toHaveTitle(/My Subscriptions/);
        await expect(page.getByText(newSubscriptionItem.displayName, { exact: true })).toBeVisible();
        await page.locator(".cursor-pointer > path").first().click();
        await page.getByRole("link", { name: "Edit" }).click();
        await expect(page).toHaveTitle(/Edit Subscription/);
        await formInputText(page, "displayName", `${newSubscriptionItem.displayName} updated`);
        await page.getByRole("button", { name: "Update" }).click();
        await expect(page).toHaveTitle(/My Subscriptions/);
        await expect(page.getByText(`${newSubscriptionItem.displayName} updated`, { exact: true })).toBeVisible();
    });

    test("activate and deactivate subscription", async () => {
        await page.getByTestId("context-menu").first().click();
        await page.getByTestId("context-menu-Deactivate").first().click();
        await expect(page.getByText("Deactivate Subscription").first()).toBeVisible();
        await page.getByRole("button", { name: "Deactivate" }).first().click();
        await expect(page.getByText("Inactive")).toBeVisible();
        await page.getByTestId("context-menu").first().click();
        await page.getByTestId("context-menu-Activate").click();
        await page.getByRole("button", { name: "Activate", exact: true }).click();
        await expect(page.getByText("Active").first()).toBeVisible();
    });

    test("delete subscription", async () => {
        await page.getByTestId("context-menu").first().click();
        await page.getByTestId("context-menu-Delete").first().click();
        await page.getByRole("button", { name: "Delete" }).first().click();
        await expect(page.getByText(`${newSubscriptionItem.displayName} updated`, { exact: true })).not.toBeVisible();
    });
});

const cleanupMySubscriptions = async (page: Page) => {
    await page.goto("/LK/dashboard/my-subscriptions");
    while (true) {
        await expect(page).toHaveTitle(/My Subscriptions/, { timeout: 20000 });
        await expect(page.getByText("results found")).toBeVisible({ timeout: 20000 });
        const allItemsCount = await page.getByTestId("dashboard-subscription-item").count();
        if (allItemsCount > 0) {
            await page.getByTestId("context-menu").first().click();
            await page.getByTestId("context-menu-Delete").first().click();
            await page.getByRole("button", { name: "Delete" }).first().click();
            if (allItemsCount === 1) {
                break;
            }

            await page.waitForTimeout(3000);
        } else {
            break;
        }
    }
};
