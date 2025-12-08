package com.eros.matchservice.projection;

import java.sql.Date;

public interface ProfileProjection {

    Long getUserId();
    String getGender();
    Date getBirthDate();
    Integer getAge();

    String getInterestedIn();
    Integer getAgeMin();
    Integer getAgeMax();
    Integer getMaxDistanceKm();

    Double getDistanceKm();
}
