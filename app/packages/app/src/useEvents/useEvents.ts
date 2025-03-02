import { Session } from "@fiftyone/state";
import { snakeCase } from "lodash";
import { MutableRefObject, useCallback, useMemo } from "react";
import { Queries } from "../makeRoutes";
import { RoutingContext } from "../routing";
import { AppReadyState, EVENTS } from "./registerEvent";

const HANDLERS = {};

const useEvents = (
  controller: AbortController,
  router: RoutingContext<Queries>,
  readyStateRef: MutableRefObject<AppReadyState>,
  session: MutableRefObject<Session>
) => {
  const eventNames = useMemo(() => Object.keys(EVENTS), []);
  const subscriptions = useMemo(() => eventNames.map(snakeCase), [eventNames]);

  const ctx = useMemo(
    () => ({ controller, router, readyStateRef, session }),
    [controller, router, readyStateRef, session]
  );
  for (let index = 0; index < eventNames.length; index++) {
    HANDLERS[eventNames[index]] = EVENTS[eventNames[index]](ctx);
  }

  return {
    subscriptions,
    handler: useCallback((event: string, payload: string) => {
      if (event === "ping") {
        return;
      }

      if (!HANDLERS[event]) {
        throw new Error(`event "${event}" is not registered`);
      }
      HANDLERS[event](JSON.parse(payload));
    }, []),
  };
};

export default useEvents;
