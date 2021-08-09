const UPGRADES = [
    {
        name: "Increment 1",
        base_cost: 10,
        cost_multiplier: 7.0 / 6,
        condition: function() {
            return true;
        },
        action: function() {
            increment += 0.1;
        },
    },
    {
        name: "Increment 2",
        base_cost: 50,
        cost_multiplier: 8.0 / 6,
        condition: function() {
            return true;
        },
        action: function() {
            increment += 5;
        },
    },
    {
        name: "Increment 3",
        base_cost: 200,
        cost_multiplier: 7.0 / 6,
        condition: function() {
            return active_upgrades.some(upgrade => upgrade.name == "Increment 2");
        },
        action: function() {
            increment += 20;
        },
    },
];

const TRIGGERS = [
    {
        condition: function() {
            return count >= 10;
        },
        action: function() {
            add_message("This is my clicky game just for you!");
        },
    },
    {
        condition: function() {
            return count >= 40;
        },
        action: function() {
            add_message("Read through the code (available on Github) to see how it works.");
        },
    },
];

let count = 0;
let partial_count = 0;
let active_upgrades = [];
let increment = 0;

function click() {
    count += 1;
    refresh();
}

function tick() {
    partial_count += increment;
    if (partial_count >= 1) {
        count += Math.floor(partial_count);
        partial_count -= Math.floor(partial_count);
    }
    for (let i = TRIGGERS.length - 1; i >= 0; i --) {
        let trigger = TRIGGERS[i];
        if (trigger.condition()) {
            trigger.action();
            TRIGGERS.splice(i, 1);
        }
    }
    refresh();
}

function refresh() {
    let count_message = count.toString() + " Number";
    if (count != 1) {
        count_message += "s";
    }
    document.getElementById("counter").innerText = count_message;
    let rounded_increment = Math.round(increment * 100) / 100;
    let increment_message = rounded_increment.toString() + " Number";
    if (rounded_increment != 1) {
        increment_message += "s";
    }
    increment_message += " / Duration";
    document.getElementById("increment").innerText = increment_message;
    populate_upgrades();
    // TODO: Repopulate upgrades
    // TODO: Change colour of upgrades if affordable/not
    let shop_list = document.getElementById("shop-items");
    for (let i = 0; i < shop_list.children.length; i ++) {
        const list_item = shop_list.children[i];
        const button = list_item.children[0];
        button.classList.remove("affordable");
        button.classList.remove("unaffordable");
        if (list_item.dataset.cost > count) {
            button.classList.add("unaffordable");
        } else {
            button.classList.add("affordable");
        }
    }
}

function populate_upgrades() {
    let shop_list = document.getElementById("shop-items");
    while(shop_list.firstChild) {
        shop_list.removeChild(shop_list.lastChild);
    }
    UPGRADES.forEach(upgrade => {
        if (upgrade.condition()) {
            let list_item = document.createElement("li");
            let button = document.createElement("button");
            let name = document.createElement("span");
            name.innerText = upgrade.name;
            name.classList.add("shop-item-name");
            let cost = document.createElement("span");
            let active_instances = active_upgrades.filter(u => u.name == upgrade.name).length;
            console.log(upgrade.base_cost, active_instances);
            let calculated_cost = Math.round(upgrade.base_cost * Math.pow(upgrade.cost_multiplier, active_instances));
            cost.innerText = calculated_cost;
            cost.classList.add("shop-item-cost");
            button.appendChild(name);
            button.appendChild(cost);
            list_item.appendChild(button);
            list_item.dataset.name = upgrade.name;
            list_item.dataset.cost = calculated_cost;
            shop_list.appendChild(list_item);
            button.onclick = function() {
                if (count >= calculated_cost) {
                    // Remove upgrade
                    active_upgrades.push(upgrade);
                    upgrade.action();
                    count -= calculated_cost;
                    refresh();
                }
            }
        }
    });
}

function add_message(message) {
    let list = document.getElementById("message-log-list");
    let list_item = document.createElement("li");
    list_item.innerText = message;
    list.appendChild(list_item);
}

function setup() {
    document.getElementById("button").onclick = click;
    populate_upgrades();
    refresh();
    setInterval(tick, 1000);
    add_message("Hi Alex");
}

window.onload = setup;
