---
title: First Steps
description: 'First steps with b.tree beekeeping software: set up options and fields, create apiaries and hives, record tasks and to-dos, and manage queens, stock, and the wax cycle.'
layout: '../layouts/IndexLayout.astro'
lang: 'en'
---

### Why should I use this app?

This web application was designed to help you keep track of the recent and past beekeeping tasks of your colonies. The basic idea was an easy record keeping tool, which is mandatory for European beekeepers when applying medications and to help fulfil the notation conditions (feeding, harvesting) for certified organic beekeepers. In addition, the collected data can be used as a basis for statistical analysis of the beekeeping operation efficiency. As an example, one can compare the honey yield of apiaries or judge queens on their performance ratings.

Although you can fill all your information in the app, which is especially useful if you have more than one labourer in your operation, it was meant as an addition to short and precise notes on your hives directly in the field. Both in combination, notes on your hives and our beekeeping web application as a tool to keep records for statistically relevant data, will allow you efficient work in the field while collecting data for measuring the efficiency.

The application may be overkill for a small hobby beekeeper with only one to two colonies; only if you like statistics and history data as we do, it is still worthwhile. For a big operation with more than a thousand colonies, it may also not be the best fit, as labourer time management and material inventory are at that scale more of a concern. We see the application as best designed for intermediate beekeeping operations with a few dozen to a few hundred colonies, especially certified organic beekeepers and their obligatory record keeping. For queen breeders, the app could be a good addition to keep record of queen performances and for beekeeper communities who share colonies, so everyone is on the same track in their notes, as our web application will always present you with the latest data without syncing needs.

### Options

It is not user-friendly, but the best first step is to go into the settings and define your select options. As nearly every beekeeper and country has its own methods for feeding, treatment etc., due to the diversity, it would make no sense for us to predefine these options. In our application, you can set most of the types in the options [/setting/option/](https://app.btree.at/setting/option/checkup_types). Here you can set types for your colony checks and visits, e.g. swarm happened, added propolis traps, alcohol wash or for your harvest sources, queen mating place and so on.

If you set a type as favourite, it will be sorted first in your selection menu. The other types are sorted alphabetically. You can also set types as inactive; this is best done for previously used types, because if you delete a type which you already used, your statistics and tables may show you wrong data. Inactive types will not show up in your selection if you create a new task (or edit your task).

### Fields

The next step would be to select the fields you want to use when adding new tasks. You can select them on a per-user basis in the options [/setting/field](https://app.btree.at/setting/field). This means that every user in your operation needs to set them for themselves.

### Apiaries

An apiary is the location where your colonies are permanently or, as a migratory beekeeper, only for a period of time. To create apiaries is the best next step to set up your application. This can be done best via our interactive apiary map [/map/apiary](https://app.btree.at/map/apiary). On this map, you can double-click anywhere to create a new apiary at that location; via drag and drop, you can move locations if you are not satisfied with them. It is also possible to edit the latitude and longitude manually. If you have a list of your locations, it may be easier to create your apiaries in the apiary table [/table/apiary](https://app.btree.at/table/apiary). On the map you have a button to print your apiary locations, a slider to define the bee flight radius and with the eye symbol you can toggle inactive apiaries.

If you need to delete an apiary, it must be empty (no colonies actively on it). But be careful, as it may change your statistics if you did a harvest on this location. Therefore, if you have an apiary which was previously used, you can set it as inactive. This will preserve all the data.

### Beehives / Colonies

The main focus of any beekeeping operation is our beehives. You can create new hives with a separate form [/new/hive](https://app.btree.at/new/hive) or in the table [/table/hive](https://app.btree.at/table/hive). The symbol near the name shows two more fields, which help you to create multiple colonies at once; they will be numbered and the number will be at the end of the name. You can define the starting counting number with the "Start" field.

- Name: Identification of your colony; in our experience, a simple number system works best, e.g. 2205 for the 5th hive in the year 2022.
- Apiary: Selection of the apiary location this hive belongs to; the migration date is important, because if you create a task before this date, the system will not know on which apiary the hive was.
- Type: Selection free to use, e.g. nuc, swarm, breeding unit
- Status: Historical or current status of the hive, e.g. sold, united, lost - queen failure, lost - AFB
- Position: Position of the hive on the apiary; this position is also reflected in the dropdown menus. If you don't use this field, the hive order will be alphabetical.
- Collection Hive: You can use this entry as a temporary collection point for multiple colonies, e.g. nucs.

### New Tasks / Quicktool

After you have finished setting up your app for your beekeeping operation's needs, you are ready to create your first tasks. The intended way is to use the Quicktool [/new/quicktool/checkup](https://app.btree.at/new/quicktool/checkup). This tool was designed to quickly create a checkup, harvest, treatment or feeding. You can choose the type of task with the first dropdown.

The next two selections are our "quick" part in the tool. Here you can select hives based on their location or select them one by one with the hive dropdown.

Most fields should be self-explanatory. As for the date, each task could go over multiple days or one day if start and end date are the same. The button on the side of the date fields is to open two more input fields, which allow you to create repeating tasks; this is especially useful for tasks like feeding which follows a pattern or treatment.

The "amount" field for feeding, treatment and harvest does have an optional dropdown for single and total. If you select total, the current amount will be divided by the number of selected hives and equally split and saved. As an example, you harvest 200 kg of honey on your apiary "A" with 10 colonies. You select "Harvest" in the Quicktool and apiary "A" via the first dropdown. You enter the date of your harvest and, as amount, 200 with the dropdown set to "total". If you now save the task, each colony on apiary "A" will have a new harvest with 20 kg of honey.

### ToDos

They are meant as simple tasks which are not relevant for a colony or statistics, e.g. bring new pallets to apiary or check water supply on apiary. The best two options to create new tasks are on the calendar [/](https://app.btree.at/) by simply double-clicking on the date you want a new ToDo to be created or with the form field [/new/todo](https://app.btree.at/new/todo). Only a few fields are available and again you can create, as with the tasks, multiple repeating ToDos with the icon on the side of the date. ToDos are also only possible as single-day events and cannot span multiple days as the other tasks can.

### Queens

Whether you want to manage your queens in our beekeeping app is optional. Each hive can only have one active queen; the active queen is decided by the date of introduction. This means that if you re-queen one of your colonies, you don't need to set your old queen inactive, simply adding a new queen with a more recent date of introduction will do the job. Queens can be created with the queen form [/new/queen](https://app.btree.at/new/queen).

- Name: Your unique identification; same as with hives, you have the possibility to create more than one at once
- Birthday: Date of queen hatching
- Queen Marking: Input field for queen labeling or colour; you can click on the button on the right to get the current year colour.
- Hive: Selection of hive(s); you can leave this field empty. If you leave it empty, your queens will be available in the special virgin table [/table/virgin](https://app.btree.at/table/virgin). This is useful if you have your queens in small mating units and already marked them for later insertion. If you select multiple hives, the same number of queens will be created automatically.
- Date of introduction: The date you introduced your new queen to the colony.
- Breeding line: Custom selection field, for example your bee breeder or seller's name or father or mother breeding line, if it is a swarm cell etc.
- Mating place: Custom selection field for example to differentiate between mating places or artificial insemination.
- Mother: Open input field for mother breeding line or any other notes on ancestry. Optionally, you can select one of your own queens in the next dropdown, if you used their eggs for grafting.

If you linked queens via the mother field, you can view the breeding lineage as a pedigree tree on the queen detail page [/table/queen](https://app.btree.at/table/queen).

### Stock

Rudimentary tool to keep track of your stock. We use it to keep track of our treatment material, sugar store and production amount. Each stock movement is a goods receipt or outgoing goods for one stock item, for example sugar. You can create a new stock movement with the form [/new/charge](https://app.btree.at/new/charge) and have an overview of your stock as table [/table/charge-stock](https://app.btree.at/table/charge-stock). If we fill a new batch of honey jars, we write the distinct lot number in the lot number field and the lot of the harvest we used in the note field. With this pattern, we can follow the goods flow. For sugar, we use the lot number field for the invoice number. Feedings, treatments, harvests and checkups can book stock automatically: give the task type a stock use, for example 0.79 kg sugar per liter of 3:2 sugar water, and each done task books its stock movement. Twice a year we make a stock count (inventory) in the storage and enter the counted total with the kind Inventory. b.tree books the difference. If you have a bigger operation, there are better tools for this kind of job, but for our small operation this works fine to keep track at least a little bit and fulfil the goods flow record keeping needed for our certification as organic beekeepers.

### Wax Cycle

The separate [wax cycle](https://app.btree.at/table/wax) documents wax lots and their movements independently from general inventory. A typical own-wax workflow is:

1. Unweighed cappings or old comb remain origin information. Create the first lot when measurable wax is available, usually as a weighed wax block.
2. Book **Store own wax**, select the required origin type, and optionally select the source colonies. Their apiary locations are determined for the booking date.
3. Book processing with one or more input and output lots. b.tree calculates the difference between input and output as processing loss. Quantities are entered in kilograms with up to two decimal places.
4. Use purchases and contract processing for external wax flows, including the supplier or processor and an optional document or order reference. Use and sale operations reduce existing lot stock.
5. Correct mistakes with a reversal entry whenever possible instead of permanently deleting records.

Wax products and origin types can be defined for each operation directly from their dropdowns. The product summary shows total stock and lot counts, empty lots are hidden by default, and the complete wax ledger can be exported as CSV.

### Print Hive Records

For record keeping or field work, you can print a summary sheet for any hive. Open the hive detail page and use the print button to generate a printer-friendly yearly overview of all tasks for that colony [/print/hive/:id](https://app.btree.at/table/hive).

### Statistics (Premium)

Premium members have access to a comprehensive statistics module [/statistic/](https://app.btree.at/statistic/hive_count) with responsive charts and tables for:

- **Hive count** - colony count trends over time per apiary
- **Harvest** - honey and resource yield by hive, apiary, year and type
- **Feeding** - feed usage by hive, apiary, year and type
- **Treatment** - treatment records by hive, apiary, year and type
- **Queen performance** - rating trends per queen and hive
- **Varroa** - mite load analysis per treatment cycle
- **Scale data** - IoT hive weight analytics over time

### Helpers

The app includes a few small utility tools accessible from the navigation:

- **Sugar Water Calculator** [/sugar_water_calculator](https://app.btree.at/sugar_water_calculator) - Calculates the required amounts of sugar and water for a target feed volume and concentration. Useful for mixing feed on the apiary.
- **Bee Lifecycle** [/lifecycle](https://app.btree.at/lifecycle) - Reference chart for the development stages (egg, larva, pupa, adult) of worker, drone and queen bees. Handy when planning treatments or rearing.

### WizBee AI Assistant (Premium)

WizBee [/wizbee](https://app.btree.at/wizbee) is an AI-powered beekeeping assistant, powered by Mistral, available exclusively for premium members. You can ask beekeeping questions in plain language, and WizBee can also work with your own records: create and update feedings, treatments, harvests, checkups, todos and stock, show statistics, and check the apiary weather. You can type or use voice input. Monthly usage is tracked and a budget limit applies to keep the service fair for all users.
