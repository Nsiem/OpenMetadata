package org.openmetadata.catalog.resources.teams;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.apache.http.client.HttpResponseException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInfo;
import org.openmetadata.catalog.CatalogApplicationTest;
import org.openmetadata.catalog.api.teams.CreateTeam;
import org.openmetadata.catalog.entity.teams.Team;
import org.openmetadata.catalog.entity.teams.User;
import org.openmetadata.catalog.exception.CatalogExceptionMessage;
import org.openmetadata.catalog.jdbi3.TeamRepository;
import org.openmetadata.catalog.resources.databases.TableResourceTest;
import org.openmetadata.catalog.resources.teams.TeamResource.TeamList;
import org.openmetadata.catalog.type.EntityReference;
import org.openmetadata.catalog.type.ImageList;
import org.openmetadata.catalog.type.Profile;
import org.openmetadata.catalog.util.JsonUtils;
import org.openmetadata.catalog.util.TestUtils;
import org.openmetadata.common.utils.JsonSchemaUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.json.JsonPatch;
import javax.ws.rs.client.WebTarget;
import java.net.URI;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static javax.ws.rs.core.Response.Status.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.openmetadata.catalog.exception.CatalogExceptionMessage.entityNotFound;
import static org.openmetadata.catalog.util.TestUtils.assertEntityPagination;
import static org.openmetadata.catalog.util.TestUtils.assertResponse;

public class TeamResourceTest extends CatalogApplicationTest {
  private static final Logger LOG = LoggerFactory.getLogger(TeamResourceTest.class);
  final Profile PROFILE = new Profile().withImages(new ImageList().withImage(URI.create("http://image.com")));

  @Test
  public void post_teamWithLongName_400_badRequest(TestInfo test) {
    // Create team with mandatory name field empty
    HttpResponseException exception =
            assertThrows(HttpResponseException.class, () -> createTeam(create(test).withName(TestUtils.LONG_ENTITY_NAME)));
    TestUtils.assertResponse(exception, BAD_REQUEST, "[name size must be between 1 and 64]");
  }

  @Test
  public void post_teamWithoutName_400_badRequest(TestInfo test) {
    // Create team with mandatory name field empty
    HttpResponseException exception = assertThrows(HttpResponseException.class, () -> createTeam(create(test).withName("")));
    TestUtils.assertResponse(exception, BAD_REQUEST, "[name size must be between 1 and 64]");
  }

  @Test
  public void post_teamAlreadyExists_409_conflict(TestInfo test) throws HttpResponseException {
    CreateTeam create = create(test);
    createTeam(create);
    HttpResponseException exception = assertThrows(HttpResponseException.class, () -> createTeam(create));
    TestUtils.assertResponse(exception, CONFLICT, CatalogExceptionMessage.ENTITY_ALREADY_EXISTS);
  }

  @Test
  public void post_validTeams_200_OK(TestInfo test) throws HttpResponseException {
    // Create team with different optional fields
    CreateTeam create = create(test, 1);
    createAndCheckTeam(create);

    create = create(test, 2).withDisplayName("displayName");
    createAndCheckTeam(create);

    create = create(test, 3).withDescription("description");
    createAndCheckTeam(create);

    create = create(test, 4).withProfile(PROFILE);
    createAndCheckTeam(create);

    create = create(test, 5).withDisplayName("displayName").withDescription("description").withProfile(PROFILE);
    createAndCheckTeam(create);
  }

  @Test
  public void post_teamWithUsers_200_OK(TestInfo test) throws HttpResponseException {
    // Add team to user relationships while creating a team
    User user1 = UserResourceTest.createUser(UserResourceTest.create(test, 1));
    User user2 = UserResourceTest.createUser(UserResourceTest.create(test, 2));
    List<UUID> users = Arrays.asList(user1.getId(), user2.getId());
    CreateTeam create = create(test).withDisplayName("displayName").withDescription("description")
            .withProfile(PROFILE).withUsers(users);
    Team team = createAndCheckTeam(create);

    // Make sure the user entity has relationship to the team
    user1 = UserResourceTest.getUser(user1.getId(), "teams");
    assertEquals(team.getId(), user1.getTeams().get(0).getId());
    user2 = UserResourceTest.getUser(user2.getId(), "teams");
    assertEquals(team.getId(), user2.getTeams().get(0).getId());
  }

  @Test
  public void get_nonExistentTeam_404_notFound() {
    HttpResponseException exception = assertThrows(HttpResponseException.class, () -> getTeam(TestUtils.NON_EXISTENT_ENTITY));
    TestUtils.assertResponse(exception, NOT_FOUND, entityNotFound("Team", TestUtils.NON_EXISTENT_ENTITY));
  }

  @Test
  public void get_teamWithDifferentFields_200_OK(TestInfo test) throws HttpResponseException {
    User user1 = UserResourceTest.createUser(UserResourceTest.create(test));
    List<UUID> users = Collections.singletonList(user1.getId());

    CreateTeam create = create(test).withDisplayName("displayName").withDescription("description")
            .withProfile(PROFILE).withUsers(users);
    Team team = createTeam(create);
    validateGetWithDifferentFields(team, false);
  }

  @Test
  public void get_teamByNameWithDifferentFields_200_OK(TestInfo test) throws HttpResponseException {
    User user1 = UserResourceTest.createUser(UserResourceTest.create(test));
    List<UUID> users = Collections.singletonList(user1.getId());

    CreateTeam create = create(test).withDisplayName("displayName").withDescription("description")
            .withProfile(PROFILE).withUsers(users);
    Team team = createTeam(create);
    validateGetWithDifferentFields(team, true);
  }

  @Test
  public void get_teamWithInvalidFields_400_BadRequest(TestInfo test) throws HttpResponseException {
    CreateTeam create = create(test);
    Team team = createTeam(create);

    // Empty query field .../teams?fields=
    HttpResponseException exception = assertThrows(HttpResponseException.class, () -> getTeam(team.getId(), ""));
    TestUtils.assertResponse(exception, BAD_REQUEST, CatalogExceptionMessage.invalidField(""));

    // .../teams?fields=invalidField
    exception = assertThrows(HttpResponseException.class, () -> getTeam(team.getId(), "invalidField"));
    TestUtils.assertResponse(exception, BAD_REQUEST, CatalogExceptionMessage.invalidField("invalidField"));
  }

  @Test
  public void get_teamListWithInvalidLimit_4xx() {
    // Limit must be >= 1 and <= 1000,000
    HttpResponseException exception = assertThrows(HttpResponseException.class, ()
            -> listTeams(null, -1, null, null));
    assertResponse(exception, BAD_REQUEST, "[query param limit must be greater than or equal to 1]");

    exception = assertThrows(HttpResponseException.class, ()
            -> listTeams(null, 0, null, null));
    assertResponse(exception, BAD_REQUEST, "[query param limit must be greater than or equal to 1]");

    exception = assertThrows(HttpResponseException.class, ()
            -> listTeams(null, 1000001, null, null));
    assertResponse(exception, BAD_REQUEST, "[query param limit must be less than or equal to 1000000]");
  }

  @Test
  public void get_teamListWithInvalidPaginationCursors_4xx() {
    // Passing both before and after cursors is invalid
    HttpResponseException exception = assertThrows(HttpResponseException.class, ()
            -> listTeams(null, 1, "", ""));
    assertResponse(exception, BAD_REQUEST, "Only one of before or after query parameter allowed");
  }

  /**
   * For cursor based pagination and implementation details:
   * @see org.openmetadata.catalog.util.ResultList#ResultList(List, int, String, String)
   *
   * The tests and various CASES referenced are base on that.
   */
  @Test
  public void get_teamListWithPagination_200(TestInfo test) throws HttpResponseException {
    // Create a large number of teams
    int maxTeams = 40;
    for (int i = 0; i < maxTeams; i++) {
      createTeam(create(test, i));
    }

    // List all teams and use it for checking pagination
    TeamList allTeams = listTeams(null, 1000000, null, null);
    int totalRecords = allTeams.getData().size();
    printTeams(allTeams);

    // List tables with limit set from 1 to maxTables size
    // Each time comapare the returned list with allTables list to make sure right results are returned
    for (int limit = 1; limit < maxTeams; limit++) {
      String after = null;
      String before = null;
      int pageCount = 0;
      int indexInAllTables = 0;
      TeamList forwardPage;
      TeamList backwardPage;
      do { // For each limit (or page size) - forward scroll till the end
        LOG.info("Limit {} forward scrollCount {} afterCursor {}", limit, pageCount, after);
        forwardPage = listTeams(null, limit, null, after);
        after = forwardPage.getPaging().getAfter();
        before = forwardPage.getPaging().getBefore();
        assertEntityPagination(allTeams.getData(), forwardPage, limit, indexInAllTables);

        if (pageCount == 0) {  // CASE 0 - First page is being returned. There is no before cursor
          assertNull(before);
        } else {
          // Make sure scrolling back based on before cursor returns the correct result
          backwardPage = listTeams(null, limit, before, null);
          assertEntityPagination(allTeams.getData(), backwardPage, limit, (indexInAllTables - limit));
        }

        printTeams(forwardPage);
        indexInAllTables += forwardPage.getData().size();
        pageCount++;
      } while (after != null);

      // We have now reached the last page - test backward scroll till the beginning
      pageCount = 0;
      indexInAllTables = totalRecords - limit - forwardPage.getData().size() ;
      do {
        LOG.info("Limit {} backward scrollCount {} beforeCursor {}", limit, pageCount, before);
        forwardPage = listTeams(null, limit, before, null);
        printTeams(forwardPage);
        before = forwardPage.getPaging().getBefore();
        assertEntityPagination(allTeams.getData(), forwardPage, limit, indexInAllTables);
        pageCount++;
        indexInAllTables -= forwardPage.getData().size();
      } while (before != null);
    }
  }

  private void printTeams(TeamList list) {
    list.getData().forEach(team -> LOG.info("Team {}", team.getName()));
    LOG.info("before {} after {} ", list.getPaging().getBefore(), list.getPaging().getAfter());
  }
  /**
   * @see TableResourceTest#put_addDeleteFollower_200
   * for tests related getting team with entities owned by the team
   */

  @Test
  public void delete_validTeam_200_OK(TestInfo test) throws HttpResponseException {
    User user1 = UserResourceTest.createUser(UserResourceTest.create(test, 1));
    List<UUID> users = Collections.singletonList(user1.getId());
    CreateTeam create = create(test).withUsers(users);
    Team team = createAndCheckTeam(create);
    deleteTeam(team.getId());

    // Make sure team is no longer there
    HttpResponseException exception = assertThrows(HttpResponseException.class, () -> getTeam(team.getId()));
    TestUtils.assertResponse(exception, NOT_FOUND, entityNotFound("Team", team.getId()));

    // Make sure user does not have relationship to this team
    User user = UserResourceTest.getUser(user1.getId(), "teams");
    assertTrue(user.getTeams().isEmpty());
  }

  @Test
  public void delete_nonExistentTeam_404_notFound() {
    HttpResponseException exception = assertThrows(HttpResponseException.class, () -> deleteTeam(TestUtils.NON_EXISTENT_ENTITY));
    TestUtils.assertResponse(exception, NOT_FOUND, entityNotFound("Team", TestUtils.NON_EXISTENT_ENTITY));
  }

  @Test
  public void patch_teamIDChange_400(TestInfo test) throws HttpResponseException, JsonProcessingException {
    // Ensure team ID can't be changed using patch
    Team team = createTeam(create(test));
    UUID oldTeamId = team.getId();
    String teamJson = JsonUtils.pojoToJson(team);
    team.setId(UUID.randomUUID());
    HttpResponseException exception = assertThrows(HttpResponseException.class, () -> patchTeam(oldTeamId, teamJson, team));
    TestUtils.assertResponse(exception, BAD_REQUEST, CatalogExceptionMessage.readOnlyAttribute("Team", "id"));
  }

  @Test
  public void patch_teamNameChange_400(TestInfo test) throws HttpResponseException, JsonProcessingException {
    // Ensure team name can't be changed using patch
    Team team = createTeam(create(test));
    String teamJson = JsonUtils.pojoToJson(team);
    team.setName("newName");
    HttpResponseException exception = assertThrows(HttpResponseException.class, () -> patchTeam(teamJson, team));
    TestUtils.assertResponse(exception, BAD_REQUEST, CatalogExceptionMessage.readOnlyAttribute("Team", "name"));
  }

  @Test
  public void patch_teamDeletedDisallowed_400(TestInfo test) throws HttpResponseException, JsonProcessingException {
    // Ensure team deleted attribute can't be changed using patch
    Team team = createTeam(create(test));
    String teamJson = JsonUtils.pojoToJson(team);
    team.setDeleted(true);
    HttpResponseException exception = assertThrows(HttpResponseException.class, () -> patchTeam(teamJson, team));
    TestUtils.assertResponse(exception, BAD_REQUEST, CatalogExceptionMessage.readOnlyAttribute("Team", "deleted"));
  }

  @Test
  public void patch_teamAttributes_200(TestInfo test) throws HttpResponseException, JsonProcessingException {
    // Create table without any attributes
    Team team = createTeam(create(test));
    assertNull(team.getDisplayName());
    assertNull(team.getDescription());
    assertNull(team.getProfile());
    assertNull(team.getDeleted());
    assertNull(team.getUsers());

    User user1 = UserResourceTest.createUser(UserResourceTest.create(test, 1));
    User user2 = UserResourceTest.createUser(UserResourceTest.create(test, 2));
    User user3 = UserResourceTest.createUser(UserResourceTest.create(test, 3));

    List<User> users = Arrays.asList(user1, user2);
    Profile profile = new Profile().withImages(new ImageList().withImage(URI.create("http://image.com")));

    // Add previously absent attributes
    team = patchTeamAttributesAndCheck(team, "displayName", "description", profile, users);

    // Replace the attributes
    users = Arrays.asList(user1, user3); // user2 dropped and user3 is added
    profile = new Profile().withImages(new ImageList().withImage(URI.create("http://image1.com")));
    team = patchTeamAttributesAndCheck(team, "displayName1", "description1", profile, users);

    // Remove the attributes
    patchTeamAttributesAndCheck(team, null, null, null, null);
  }
//  @Test
//  public void patch_updateInvalidUsers_404_notFound(TestInfo test) throws HttpResponseException {
//    CreateTeam create = create(test);
//    Team team = createAndCheckTeam(create);
//
//    // User patch to add team to user relationship to an invalid user
//    List<UUID> users = Collections.singletonList(UUID.randomUUID() /* invalid userId */);
//    UpdateTeam update = new UpdateTeam().withUsers(users);
//    HttpResponseException exception = assertThrows(HttpResponseException.class, () -> updateTeam(team.getId(), update));
//    assertEquals(Response.Status.NOT_FOUND.getStatusCode(), exception.getStatusCode());
//  }

  public static Team createAndCheckTeam(CreateTeam create) throws HttpResponseException {
    Team team = createTeam(create);
    List<User> expectedUsers = new ArrayList<>();
    for (UUID teamId : Optional.ofNullable(create.getUsers()).orElse(Collections.emptyList())) {
      expectedUsers.add(new User().withId(teamId));
    }
    assertEquals(team.getName(), create.getName());
    validateTeam(team, create.getDescription(), create.getDisplayName(), create.getProfile(), expectedUsers);

    // Get the newly created team and validate it
    Team getTeam = getTeam(team.getId(), "profile,users");
    assertEquals(team.getName(), create.getName());
    validateTeam(getTeam, create.getDescription(), create.getDisplayName(), create.getProfile(), expectedUsers);
    return team;
  }

  public static Team createTeam(CreateTeam create) throws HttpResponseException {
    return TestUtils.post(CatalogApplicationTest.getResource("teams"), create, Team.class);
  }

  public static Team getTeam(UUID id) throws HttpResponseException {
    return getTeam(id, null);
  }

  public static Team getTeam(UUID id, String fields) throws HttpResponseException {
    WebTarget target = CatalogApplicationTest.getResource("teams/" + id);
    target = fields != null ? target.queryParam("fields", fields) : target;
    return TestUtils.get(target, Team.class);
  }

  public static TeamList listTeams(String fields, Integer limit, String before, String after) throws HttpResponseException {
    WebTarget target = CatalogApplicationTest.getResource("teams");
    target = fields != null ? target.queryParam("fields", fields) : target;
    target = limit != null ? target.queryParam("limit", limit) : target;
    target = before != null ? target.queryParam("before", before) : target;
    target = after != null ? target.queryParam("after", after) : target;
    return TestUtils.get(target, TeamList.class);
  }


  public static Team getTeamByName(String name, String fields) throws HttpResponseException {
    WebTarget target = CatalogApplicationTest.getResource("teams/name/" + name);
    target = fields != null ? target.queryParam("fields", fields) : target;
    return TestUtils.get(target, Team.class);
  }

  private static void validateTeam(Team team, String expectedDescription, String expectedDisplayName,
                                   Profile expectedProfile, List<User> expectedUsers) {
    assertNotNull(team.getId());
    assertNotNull(team.getHref());
    assertEquals(expectedDescription, team.getDescription());
    assertEquals(expectedDisplayName, team.getDisplayName());
    assertEquals(expectedProfile, team.getProfile());
    if (expectedUsers != null && !expectedUsers.isEmpty()) {
      assertEquals(expectedUsers.size(), team.getUsers().size());
      for (EntityReference user : team.getUsers()) {
        TestUtils.validateEntityReference(user);
        boolean foundUser = false;
        for (User expected : expectedUsers) {
          if (expected.getId().equals(user.getId())) {
            foundUser = true;
            break;
          }
        }
        assertTrue(foundUser);
      }
    }
    TestUtils.validateEntityReference(team.getOwns());
  }

  /** Validate returned fields GET .../teams/{id}?fields="..." or GET .../teams/name/{name}?fields="..." */
  private void validateGetWithDifferentFields(Team team, boolean byName) throws HttpResponseException {
    // .../teams?fields=profile
    String fields = "profile";
    team = byName ? getTeamByName(team.getName(), fields) : getTeam(team.getId(), fields);
    assertNotNull(team.getProfile());
    assertNull(team.getUsers());

    // .../teams?fields=profile,users
    fields = "profile,users";
    team = byName ? getTeamByName(team.getName(), fields) : getTeam(team.getId(), fields);
    assertNotNull(team.getProfile());
    assertNotNull(team.getUsers());
  }

  private Team patchTeam(UUID teamId, String originalJson, Team updated) throws JsonProcessingException, HttpResponseException {
    String updatedJson = JsonUtils.pojoToJson(updated);
    JsonPatch patch = JsonSchemaUtil.getJsonPatch(originalJson, updatedJson);
    return TestUtils.patch(CatalogApplicationTest.getResource("teams/" + teamId), patch, Team.class);
  }
  private Team patchTeam(String originalJson, Team updated) throws JsonProcessingException, HttpResponseException {
    return patchTeam(updated.getId(), originalJson, updated);
  }

  private Team patchTeamAttributesAndCheck(Team team, String displayName, String description, Profile profile, List<User> users)
          throws JsonProcessingException, HttpResponseException {
    Optional.ofNullable(team.getUsers()).orElse(Collections.emptyList()).forEach(t -> t.setHref(null)); // Remove href
    String tableJson = JsonUtils.pojoToJson(team);

    // Update the table attributes
    team.setDisplayName(displayName);
    team.setDescription(description);
    team.setProfile(profile);
    team.setUsers(TeamRepository.toEntityReference(users));

    // Validate information returned in patch response has the updates
    Team updatedTeam = patchTeam(tableJson, team);
    validateTeam(updatedTeam, description, displayName, profile, users);

    // GET the table and Validate information returned
    Team getTeam = getTeam(team.getId(), "users,profile");
    validateTeam(getTeam, description, displayName, profile, users);
    return  getTeam;
  }

  public void deleteTeam(UUID id) throws HttpResponseException {
    TestUtils.delete(CatalogApplicationTest.getResource("teams/" + id));
  }

  public static CreateTeam create(TestInfo test, int index) {
    return new CreateTeam().withName(getTeamName(test) + index);
  }

  public static CreateTeam create(TestInfo test) {
    return new CreateTeam().withName(getTeamName(test));
  }

  public static String getTeamName(TestInfo test) {
    return String.format("team_%s", test.getDisplayName());
  }
}