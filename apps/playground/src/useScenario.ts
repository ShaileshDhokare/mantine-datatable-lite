import { useSearchParams } from 'react-router';

/** Shareable scenario URLs that also work with GitHub Pages hash routing. */
export function useScenario<Id extends string>(scenarios: readonly { id: Id }[]): [Id, (id: Id) => void] {
  const [params, setParams] = useSearchParams();
  const requested = params.get('scenario');
  const active = scenarios.find((scenario) => scenario.id === requested)?.id ?? scenarios[0].id;
  return [active, (id) => setParams({ scenario: id })];
}
