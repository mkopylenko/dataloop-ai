interface Database {

    saveStreets(streets: any): Promise<void>;
}

export default Database;