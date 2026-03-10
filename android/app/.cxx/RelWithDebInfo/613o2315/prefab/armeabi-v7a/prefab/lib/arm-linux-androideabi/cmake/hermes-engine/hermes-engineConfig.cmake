if(NOT TARGET hermes-engine::hermesvm)
add_library(hermes-engine::hermesvm SHARED IMPORTED)
set_target_properties(hermes-engine::hermesvm PROPERTIES
    IMPORTED_LOCATION "/Users/sravi/.gradle/caches/8.13/transforms/240dc146c215a89bf05a01f607c07233/transformed/hermes-android-0.82.0-release/prefab/modules/hermesvm/libs/android.armeabi-v7a/libhermesvm.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/sravi/.gradle/caches/8.13/transforms/240dc146c215a89bf05a01f607c07233/transformed/hermes-android-0.82.0-release/prefab/modules/hermesvm/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

