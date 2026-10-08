import { useSearchParams } from 'react-router-dom';
import { Person } from '../types/Person';
import { SearchLink } from './SearchLink';
import { getSearchWith } from '../utils/searchHelper';

type Props = {
  people: Person[];
};

type SortField = 'name' | 'sex' | 'born' | 'died';

export const PeopleTable = ({ people }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get('query')?.toLowerCase() || '';
  const sex = searchParams.get('sex');
  const centuries = searchParams.getAll('centuries');
  const sort = searchParams.get('sort') as SortField | null;
  const order = searchParams.get('order');

  const filteredPeople = people.filter(person => {
    const matchesSex = !sex || person.sex === sex;

    const matchesQuery =
      !query ||
      person.name.toLowerCase().includes(query) ||
      (person.motherName?.toLowerCase().includes(query) ?? false) ||
      (person.fatherName?.toLowerCase().includes(query) ?? false);

    const matchesCentury =
      centuries.length === 0 ||
      centuries.includes(String(Math.floor(person.born / 100) + 1));

    return matchesSex && matchesQuery && matchesCentury;
  });

  const sortedPeople = [...filteredPeople];

  if (sort) {
    sortedPeople.sort((person1, person2) => {
      let result = 0;

      if (sort === 'name') {
        result = person1.name.localeCompare(person2.name);
      }

      if (sort === 'sex') {
        result = person1.sex.localeCompare(person2.sex);
      }

      if (sort === 'born') {
        result = person1.born - person2.born;
      }

      if (sort === 'died') {
        result = person1.died - person2.died;
      }

      return order === 'desc' ? -result : result;
    });
  }

  const handleSort = (field: SortField) => {
    if (sort !== field) {
      setSearchParams(
        getSearchWith(searchParams, {
          sort: field,
          order: null,
        }),
      );

      return;
    }

    if (!order) {
      setSearchParams(
        getSearchWith(searchParams, {
          sort: field,
          order: 'desc',
        }),
      );

      return;
    }

    setSearchParams(
      getSearchWith(searchParams, {
        sort: null,
        order: null,
      }),
    );
  };

  const getSortIcon = (field: SortField) => {
    if (sort !== field) {
      return 'fas fa-sort';
    }

    return order === 'desc' ? 'fas fa-sort-down' : 'fas fa-sort-up';
  };

  return (
    <table
      data-cy="peopleTable"
      className="table is-striped is-hoverable is-narrow is-fullwidth"
    >
      <thead>
        <tr>
          <th>
            <span className="is-flex is-flex-wrap-nowrap">
              Name
              <button
                type="button"
                className="button is-white p-0"
                onClick={() => handleSort('name')}
              >
                <span className="icon">
                  <i className={getSortIcon('name')} />
                </span>
              </button>
            </span>
          </th>

          <th>
            <span className="is-flex is-flex-wrap-nowrap">
              Sex
              <button
                type="button"
                className="button is-white p-0"
                onClick={() => handleSort('sex')}
              >
                <span className="icon">
                  <i className={getSortIcon('sex')} />
                </span>
              </button>
            </span>
          </th>

          <th>
            <span className="is-flex is-flex-wrap-nowrap">
              Born
              <button
                type="button"
                className="button is-white p-0"
                onClick={() => handleSort('born')}
              >
                <span className="icon">
                  <i className={getSortIcon('born')} />
                </span>
              </button>
            </span>
          </th>

          <th>
            <span className="is-flex is-flex-wrap-nowrap">
              Died
              <button
                type="button"
                className="button is-white p-0"
                onClick={() => handleSort('died')}
              >
                <span className="icon">
                  <i className={getSortIcon('died')} />
                </span>
              </button>
            </span>
          </th>

          <th>Mother</th>
          <th>Father</th>
        </tr>
      </thead>

      <tbody>
        {sortedPeople.map(person => (
          <tr key={person.slug} data-cy="person">
            <td>
              <SearchLink to={`/people/${person.slug}`} params={{}}>
                {person.name}
              </SearchLink>
            </td>

            <td>{person.sex}</td>

            <td>{person.born}</td>

            <td>{person.died}</td>

            <td>
              {person.mother ? (
                <SearchLink to={`/people/${person.mother.slug}`} params={{}}>
                  {person.motherName}
                </SearchLink>
              ) : (
                person.motherName || '-'
              )}
            </td>

            <td>
              {person.father ? (
                <SearchLink to={`/people/${person.father.slug}`} params={{}}>
                  {person.fatherName}
                </SearchLink>
              ) : (
                person.fatherName || '-'
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
