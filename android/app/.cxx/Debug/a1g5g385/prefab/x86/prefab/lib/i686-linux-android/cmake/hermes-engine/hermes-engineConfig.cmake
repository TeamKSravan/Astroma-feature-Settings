if(NOT TARGET hermes-engine::hermesvm)
add_library(hermes-engine::hermesvm SHARED IMPORTED)
set_target_properties(hermes-engine::hermesvm PROPERTIES
    IMPORTED_LOCATION "/Users/sravi/.gradle/caches/8.13/transforms/be75acca8cdf1dd9901d92451a5d8a7f/transformed/hermes-android-0.82.0-debug/prefab/modules/hermesvm/libs/android.x86/libhermesvm.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/sravi/.gradle/caches/8.13/transforms/be75acca8cdf1dd9901d92451a5d8a7f/transformed/hermes-android-0.82.0-debug/prefab/modules/hermesvm/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

