"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreetsService = void 0;
var axios_1 = require("axios");
var cities_1 = require("../cities/cities");
// ✅ Constants
var DATA_GOV_API_URL = 'https://data.gov.il/api/3/action/datastore_search';
var STREETS_RESOURCE_ID = '1b14e41c-85b3-4c21-bdce-9fe48185ffca';
var MAX_RESULTS = 100000;
var StreetsService = /** @class */ (function () {
    function StreetsService() {
    }
    StreetsService.prototype.getStreetsInCity = function (city) {
        return __awaiter(this, void 0, void 0, function () {
            var response, results, streets;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('Calling city streets info endpoint');
                        return [4 /*yield*/, axios_1.default.post(DATA_GOV_API_URL, {
                                resource_id: STREETS_RESOURCE_ID,
                                filters: { city_name: cities_1.cities[city] },
                                limit: MAX_RESULTS,
                            })];
                    case 1:
                        response = _a.sent();
                        results = response.data.result.records;
                        if (!results || !results.length) {
                            throw new Error('No streets found for city: ' + city);
                        }
                        streets = results.map(function (street) { return ({
                            streetId: street._id,
                        }); });
                        return [2 /*return*/, { city: city, streets: streets }];
                }
            });
        });
    };
    StreetsService.prototype.getStreetInfoById = function (ids) {
        return __awaiter(this, void 0, void 0, function () {
            var response, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('Calling street info endpoint');
                        return [4 /*yield*/, axios_1.default.post(DATA_GOV_API_URL, {
                                resource_id: STREETS_RESOURCE_ID,
                                filters: { _id: ids },
                            })];
                    case 1:
                        response = _a.sent();
                        results = response.data.result.records;
                        if (!results || !results.length) {
                            throw new Error('No streets found for ids: ' + ids.join(', '));
                        }
                        return [2 /*return*/, results.map(function (item) { return ({
                                streetId: item._id,
                                region_code: item.region_code,
                                region_name: item.region_name.trim(),
                                city_code: item.city_code,
                                city_name: cities_1.enlishNameByCity[item.city_name] || item.city_name,
                                street_code: item.street_code,
                                street_name: item.street_name.trim(),
                                street_name_status: item.street_name_status.trim(),
                                official_code: item.official_code,
                            }); })];
                }
            });
        });
    };
    return StreetsService;
}());
exports.StreetsService = StreetsService;
