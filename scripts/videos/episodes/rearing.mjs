// Queen rearing: the method with its steps, and a series in the calendar.
import { call, withApi } from '../../screenshots/demo.mjs';

// Texts of the app that the actions look for, and the name of the new series.
// The steps are steps of the method that each new company has.
const APP = {
  de: {
    rearing: 'Königinnenzucht',
    add: 'Hinzufügen',
    cage: 'Käfigen',
    graft: 'Umlarven',
    series: 'Zucht 1',
  },
  en: {
    rearing: 'Queen rearing',
    add: 'Add',
    cage: 'Cage Queencells',
    graft: 'Grafting',
    series: 'Series 1',
  },
};
// The series starts on this day of the next month, at this hour.
const DAY = 15;
const HOUR = 14;

export default {
  name: 'rearing',
  route: () => '/',
  // A run that failed can leave its series, so remove it first too.
  before: removeSeries,
  after: removeSeries,
  scenes: [
    {
      text: {
        de: 'Mit b.tree planst du deine Königinnenzucht. Eine Methode legt die Schritte fest. Eine Zuchtserie berechnet daraus die Termine.',
        en: 'With b.tree, you plan your queen rearing. A method defines the steps. A series calculates the dates from the method.',
      },
    },
    {
      text: {
        de: 'Öffne im Menü Königinnenzucht und dann Methode. Eine Methode ist schon angelegt, mit ihren Schritten und Wartezeiten.',
        en: 'In the menu, open Queen rearing and then Method. One method is there from the start, with its steps and waiting times.',
      },
      action: async (page, { demo, ui }) => {
        await ui.tap(
          page
            .locator('.q-drawer')
            .getByText(APP[demo.lang].rearing, { exact: true }),
        );
        await ui.tap(drawer(page, '/setting/rearing'));
      },
    },
    {
      text: {
        de: 'Passe sie an deine Betriebsweise an. Klicke auf einen Schritt. Mit Plus und Minus änderst du die Wartezeit, mit den Pfeilen die Reihenfolge.',
        en: 'Adapt it to your way of beekeeping. Click a step. Plus and minus change the waiting time, and the arrows change the order.',
      },
      action: async (page, { demo, ui }) => {
        const step = page
          .locator('.q-page-container .q-item')
          .filter({ hasText: APP[demo.lang].cage });
        await ui.wait(2500);
        await ui.tap(step.locator('.text-bold'));
        await ui.wait(1500);
        await ui.point(step.locator('.q-btn:has(.fa-plus)'));
        await ui.wait(2000);
        await ui.point(step.locator('.q-btn:has(.fa-arrow-up)'));
      },
    },
    {
      text: {
        de: 'Eigene Schritte legst du im Reiter Zuchtschritte an. Mit Hinzufügen erstellst du eine weitere Methode.',
        en: 'On the Rearing Steps tab, you create your own steps. With Add, you create another method.',
      },
      action: async (page, { demo, ui }) => {
        await ui.tap(page.getByRole('tab').nth(1));
        await ui.point(page.locator('[data-cy="btn-table-new"]'));
        await ui.wait(2000);
        await ui.tap(page.getByRole('tab').nth(0));
        await ui.point(
          page.getByRole('button', { name: APP[demo.lang].add, exact: true }),
        );
      },
    },
    {
      text: {
        de: 'Jetzt kommt die Zuchtserie. Öffne Königinnenzucht und Hinzufügen, und gib der Serie einen Namen.',
        en: 'Now create the series. Open Queen rearing and Add, and give the series a name.',
      },
      action: async (page, { demo, ui }) => {
        await ui.tap(drawer(page, '/new/rearing'));
        await ui.type(
          form(page).locator('input').first(),
          APP[demo.lang].series,
        );
      },
    },
    {
      text: {
        de: 'Wähle Datum und Uhrzeit. Wähle dann den Schritt, für den dieser Termin gilt. Hier ist es das Umlarven.',
        en: 'Select the date and the time. Then select the step that this date is for. Here it is the grafting.',
      },
      action: async (page, { demo, ui }) => {
        await ui.tap(form(page).locator('input[readonly]').first());
        // The third button of the navigation is "next month".
        await ui.tap(page.locator('.q-date__navigation .q-btn').nth(2));
        await ui.tap(
          page.locator('.q-date__calendar-item--in', {
            hasText: new RegExp(`^${DAY}$`),
          }),
        );
        // The clock shows the hours first and then the minutes.
        await clock(page, ui, HOUR);
        await clock(page, ui, 0);
        await ui.tap(page.locator('.q-date .q-btn').last());
        await ui.tap(form(page).locator('.q-select').nth(1));
        await ui.tap(
          page.locator('.q-menu .q-item', { hasText: APP[demo.lang].graft }),
        );
      },
    },
    {
      text: {
        de: 'b.tree rechnet alle anderen Schritte aus, die davor und die danach. Speichere die Serie.',
        en: 'b.tree calculates all other steps, the ones before and the ones after. Save the series.',
      },
      action: async (page, { ui }) => {
        await ui.wait(3000);
        await ui.tap(page.locator('[data-cy="btn-form-save"]'));
      },
    },
    {
      text: {
        de: 'Im Kalender siehst du alle Schritte der Serie.',
        en: 'In the calendar, you see all steps of the series.',
      },
      action: async (page, { ui }) => {
        await ui.tap(drawer(page, '/'));
        await ui.tap(page.locator('[data-cy="calendar-btn-next"]'));
      },
    },
    {
      text: {
        de: 'Ein Klick auf einen Schritt zeigt den ganzen Zeitplan.',
        en: 'A click on a step shows the full schedule.',
      },
      action: async (page, { demo, ui }) => {
        await ui.tap(event(page, demo));
      },
    },
    {
      text: {
        de: 'Passt ein Termin nicht, dann zieh den Schritt auf einen anderen Tag. Alle anderen Schritte wandern mit.',
        en: 'When a date does not fit, drag the step to another day. All other steps move with it.',
      },
      action: async (page, { demo, ui }) => {
        await page.keyboard.press('Escape');
        await ui.wait(1500);
        // An event is as wide as one day of the calendar.
        const box = await event(page, demo).boundingBox();
        await ui.drag(event(page, demo), { x: 2 * (box.width + 8), y: 0 });
      },
    },
    {
      text: {
        de: 'Noch ein Hinweis: Eine gelöschte Methode kann niemand wiederherstellen. Benenne eine alte Methode lieber um.',
        en: 'One more note: nobody can restore a deleted method. It is better to rename an old method.',
      },
    },
  ],
};

// Remove the series that the episode makes.
function removeSeries() {
  return withApi(async (api) => {
    const names = new Set(Object.values(APP).map((t) => t.series));
    const ids = (await call(api, 'GET', 'rearing')).results
      .filter((series) => names.has(series.name))
      .map((series) => series.id);
    if (ids.length > 0) {
      await call(api, 'PATCH', 'rearing/batchDelete', { ids });
    }
  });
}

// The menu entry that opens the route.
function drawer(page, route) {
  return page.locator(`.q-drawer a[href="${route}"]`).first();
}

function form(page) {
  return page.locator('[data-cy="form-rearing"]');
}

// The grafting step of the series in the calendar.
function event(page, demo) {
  return page
    .locator('.calendar-daygrid-event')
    .filter({ hasText: APP[demo.lang].graft });
}

// Click a number of the clock. The hand of the clock covers the numbers, so
// the click goes to the position and not to the element.
async function clock(page, ui, number) {
  const position = page.locator('.q-time__clock-position', {
    hasText: new RegExp(`^0?${number}$`),
  });
  await ui.point(position);
  const box = await position.boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await ui.wait(500);
}
