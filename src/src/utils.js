/**
 * Created by andrey on 04.06.2024.
 */
import axios from "axios";

export default {
    logEvent: function (eventName, projectId) {
        const apiUrl = process.env.NODE_ENV === "staging" ? "https://metrics-staging.labsystech.ru/" : "https://metrics.cleverappssg.com/";
        const source = "cleverappssg.com";

        const headers = {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache"
        };

        axios.post(`${apiUrl + projectId}/events/`, {
            source,
            events: [eventName],
            params: [{}]
        }, {
            headers 
        });
    }
};
