package org.openmetadata.catalog.util;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.openmetadata.catalog.entity.data.Table;
import org.openmetadata.catalog.entity.teams.User;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class RestUtilTest {
  @Test
  public void testFields() {
    // Anonymous class with JsonProperties to extract
    Object entity = new Object() {
      @JsonProperty("attribute1")
      public int attribute1;

      @JsonProperty("attribute2")
      public String attribute2;

      @JsonProperty("relationship1")
      public User relationship1; // User is an entity class

      @JsonProperty("relationship2")
      public Table relationship2; // Table is an entity class
    };

    // Get attributes (that are fields with types that are not entity classes)
    List<String> attributes = RestUtil.getAttributes(entity.getClass());
    List<String> expectedAttributes = Arrays.asList("attribute1", "attribute2");
    assertEquals(expectedAttributes.size(), attributes.size());
    assertTrue(attributes.containsAll(expectedAttributes) && expectedAttributes.containsAll(attributes));

    // Get relationships (that are fields with types that are entity classes)
    List<String> relationships = RestUtil.getRelationships(entity.getClass());
    List<String> expectedRelationships = Arrays.asList("relationship1", "relationship2");
    assertEquals(expectedRelationships.size(), relationships.size());
    assertTrue(relationships.containsAll(expectedRelationships) && expectedRelationships.containsAll(relationships));
  }
}