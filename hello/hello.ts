import {api} from "encore.dev/api";
import knex from "knex";
import log from "encore.dev/log";
import {SQLDatabase} from "encore.dev/storage/sqldb";


// Create the todo database and assign it to the "db" variable
const db = new SQLDatabase("todo", {
    migrations: "./migrations",
});

const orm = knex({
    client: "pg",
    connection: db.connectionString,
});

export interface TodoItem {
    id: number;
    title: string;
    done: boolean;
}

const TodoItem = () => orm<TodoItem>("todo_item");


interface GetTodoResponse {
    todos: TodoItem[];
}


interface TodoRequest {
    title: string;
}

interface TodoResponse {
    message: string;
}

export const get = api(
    {method: "GET", path: "/todo", expose: true},
    async (): Promise<GetTodoResponse> => {
        let todos: TodoItem[] = await TodoItem().select();

        return {todos};
    },
);

export const post = api<TodoRequest, TodoResponse>(
    {method: "POST", path: "/todo", expose: true},
    async (req) => {
        const {title} = req;
        await db.exec`
          INSERT INTO todo_item (title, done)
          VALUES (${title}, false);
        `
        return {message: "Successfully added todo item"};
    },
);
