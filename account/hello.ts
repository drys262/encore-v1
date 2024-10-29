import {api} from "encore.dev/api";
import knex from "knex";
import log from "encore.dev/log";
import { Subscription } from "encore.dev/pubsub"
import {SQLDatabase} from "encore.dev/storage/sqldb";
import { Topic } from 'encore.dev/pubsub';
import { CronJob } from "encore.dev/cron";


const db = new SQLDatabase("account", {
    migrations: "./migrations",
});

const orm = knex({
    client: "pg",
    connection: db.connectionString,
});

export interface SignupEvent {
    userID: string;
}

export interface Account {
    id: number;
    name: string;
    active: boolean;
}

interface CreateAccountRequest {
    name: string;
}

interface CreateAccountResponse {
    message: string;
}

const Account = () => orm<Account>("account");

export const signups = new Topic<SignupEvent>("signups", {
    deliveryGuarantee: "at-least-once"
})


export const post = api<CreateAccountRequest, CreateAccountResponse>(
    {method: "POST", path: "/account", expose: true},
    async (req) => {

        const { name } = req;
        const result = await Account().insert({
            name,
            active: true,
        }).returning("*").limit(1);

        const [account] = result;

        await signups.publish({ userID: account.id.toString() })

        return { message: "Account created" };
    },
);


// const sendWelcomeEmailSubscription = new Subscription(signups, "send-welcome-email", {
//     handler: async (event) => {
//         log.info("SEND WELCOME EMAIL");
//         log.info(event.userID);
//         // call AWS SES or sendgrid to send the email
//         // use email templates then send to user
//     }
// })

export const initializeAccount = api({}, async () => {
    const result = await Account().select();
    log.info("INITIALIZE ACCOUNT");
    log.info(JSON.stringify(result));
    return { message: "Initialized account"}
});

const _ = new CronJob("initialize-account", {
    title: "initialize-account",
    every: "60s",
    endpoint: initializeAccount,
})

